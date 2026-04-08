import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const rootDir = process.cwd();
const postsDir = path.join(rootDir, 'src', 'content', 'posts');
const publicDir = path.resolve(rootDir, 'public');

const requiredFieldsForPublished = [
  'title',
  'date',
  'slug',
  'excerpt',
  'coverImage',
  'coverImageAlt',
  'tags',
];

const knownCategories = new Set([
  'Persönliches',
  'Schreiben',
  'Gedanken',
  'Glaube',
  'Streit',
  'Kindheit',
  'Kultur',
  'Literatur',
  'Identität',
  'Liebe',
]);

const strictDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00DF/g, 'ss')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isInsideDir(candidatePath, parentDir) {
  const relative = path.relative(parentDir, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function parseStrictDate(value) {
  if (!isNonEmptyString(value) || !strictDatePattern.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  const iso = parsed.toISOString().slice(0, 10);
  return iso === value ? parsed : null;
}

function validatePost(filePath) {
  const relPath = path.relative(rootDir, filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);
  const errors = [];
  const warnings = [];
  const isPublished = data.published !== false;

  if (isPublished) {
    for (const field of requiredFieldsForPublished) {
      const value = data[field];
      const isMissing = field === 'tags'
        ? !Array.isArray(value) || value.length === 0
        : !isNonEmptyString(value);

      if (isMissing) {
        errors.push(`${relPath}: missing required frontmatter field "${field}".`);
      }
    }
  }

  if (isNonEmptyString(data.title)) {
    const length = data.title.trim().length;
    if (length < 4 || length > 90) {
      errors.push(`${relPath}: "title" length should be between 4 and 90 characters.`);
    }
  }

  if (isNonEmptyString(data.excerpt)) {
    const length = data.excerpt.trim().length;
    if (length < 40 || length > 220) {
      errors.push(`${relPath}: "excerpt" length should be between 40 and 220 characters.`);
    }
  }

  const parsedDate = parseStrictDate(data.date);
  if (isNonEmptyString(data.date) && !parsedDate) {
    errors.push(`${relPath}: invalid "date" value "${data.date}" (required format: YYYY-MM-DD).`);
  }

  const parsedUpdatedAt = parseStrictDate(data.updatedAt);
  if (isNonEmptyString(data.updatedAt) && !parsedUpdatedAt) {
    errors.push(`${relPath}: invalid "updatedAt" value "${data.updatedAt}" (required format: YYYY-MM-DD).`);
  }

  if (parsedDate && parsedUpdatedAt && parsedUpdatedAt.getTime() < parsedDate.getTime()) {
    errors.push(`${relPath}: "updatedAt" must not be earlier than "date".`);
  }

  if (isNonEmptyString(data.slug)) {
    const normalized = normalizeSlug(data.slug);
    if (data.slug !== normalized) {
      errors.push(`${relPath}: "slug" should be normalized as "${normalized}".`);
    }
  }

  if (isNonEmptyString(data.category) && !knownCategories.has(data.category.trim())) {
    warnings.push(`${relPath}: unknown category "${data.category}".`);
  }

  if (Array.isArray(data.tags)) {
    const seen = new Set();

    for (const [index, rawTag] of data.tags.entries()) {
      if (typeof rawTag !== 'string' || rawTag.trim().length === 0) {
        errors.push(`${relPath}: tags[${index}] must be a non-empty string.`);
        continue;
      }

      const tag = rawTag.replace(/\s+/g, ' ').trim();
      if (tag.length > 30) {
        errors.push(`${relPath}: tag "${tag}" exceeds 30 characters.`);
      }

      const slug = normalizeSlug(tag);
      if (!slug) {
        errors.push(`${relPath}: tag "${tag}" is invalid after normalization.`);
        continue;
      }

      if (seen.has(slug)) {
        errors.push(`${relPath}: duplicate tag "${tag}".`);
      } else {
        seen.add(slug);
      }
    }

    if (data.tags.length > 8) {
      errors.push(`${relPath}: use at most 8 tags per post.`);
    }
  } else if (data.tags !== undefined) {
    errors.push(`${relPath}: "tags" must be an array of strings.`);
  }

  if (isNonEmptyString(data.coverImage)) {
    const coverImage = data.coverImage.trim();
    if (!coverImage.startsWith('/')) {
      errors.push(`${relPath}: "coverImage" must start with "/".`);
    } else {
      const absoluteImagePath = path.resolve(publicDir, coverImage.slice(1));
      if (!isInsideDir(absoluteImagePath, publicDir)) {
        errors.push(`${relPath}: "coverImage" points outside of /public.`);
      } else if (!fs.existsSync(absoluteImagePath)) {
        errors.push(`${relPath}: missing cover image file "${coverImage}".`);
      }
    }
  }

  if (isNonEmptyString(data.coverImageAlt)) {
    if (data.coverImageAlt.trim().length < 8 || data.coverImageAlt.trim().length > 160) {
      errors.push(`${relPath}: "coverImageAlt" should be between 8 and 160 characters.`);
    }
  }

  if (isNonEmptyString(data.seoTitle) && data.seoTitle.trim().length > 65) {
    errors.push(`${relPath}: "seoTitle" should not exceed 65 characters.`);
  }

  if (isNonEmptyString(data.seoDescription)) {
    const length = data.seoDescription.trim().length;
    if (length < 50 || length > 170) {
      errors.push(`${relPath}: "seoDescription" should be between 50 and 170 characters.`);
    }
  }

  if (isNonEmptyString(data.canonicalUrl)) {
    try {
      const parsed = new URL(data.canonicalUrl.trim());
      if (parsed.protocol !== 'https:') {
        errors.push(`${relPath}: "canonicalUrl" must use https.`);
      }
    } catch {
      errors.push(`${relPath}: invalid "canonicalUrl" URL.`);
    }
  }

  if (typeof data.featured !== 'undefined' && typeof data.featured !== 'boolean') {
    errors.push(`${relPath}: "featured" must be a boolean.`);
  }

  if (typeof data.published !== 'undefined' && typeof data.published !== 'boolean') {
    errors.push(`${relPath}: "published" must be a boolean.`);
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount < 120) {
    warnings.push(`${relPath}: content is short (${wordCount} words).`);
  }

  return { errors, warnings };
}

function main() {
  if (!fs.existsSync(postsDir)) {
    console.error(`Content validation failed: posts directory not found (${postsDir}).`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(postsDir)
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => path.join(postsDir, entry));

  const errors = [];
  const warnings = [];

  for (const file of files) {
    const result = validatePost(file);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (warnings.length > 0) {
    console.warn('Content validation warnings:');
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error('Content validation failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Content validation passed for ${files.length} post(s).`);
}

main();
