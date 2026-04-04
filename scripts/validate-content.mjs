import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const rootDir = process.cwd();
const postsDir = path.join(rootDir, 'src', 'content', 'posts');
const publicDir = path.resolve(rootDir, 'public');
const requiredFields = ['title', 'date', 'slug', 'excerpt', 'coverImage'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isInsideDir(candidatePath, parentDir) {
  const relative = path.relative(parentDir, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function validatePost(filePath) {
  const relPath = path.relative(rootDir, filePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(source);
  const errors = [];

  for (const field of requiredFields) {
    if (!isNonEmptyString(data[field])) {
      errors.push(`${relPath}: missing required frontmatter field "${field}".`);
    }
  }

  if (isNonEmptyString(data.date)) {
    const parsedDate = new Date(data.date);
    if (Number.isNaN(parsedDate.getTime())) {
      errors.push(`${relPath}: invalid "date" value "${data.date}".`);
    }
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

  return errors;
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

  const errors = files.flatMap((file) => validatePost(file));

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
