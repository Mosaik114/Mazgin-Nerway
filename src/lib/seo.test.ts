import { describe, expect, it } from 'vitest';
import { toAbsoluteUrl, toIsoDateOrNull, toJsonLd } from './seo';

describe('seo helpers', () => {
  it('builds absolute URLs for relative paths', () => {
    expect(toAbsoluteUrl('/blog')).toBe('https://nerway.de/blog');
    expect(toAbsoluteUrl('contact')).toBe('https://nerway.de/contact');
  });

  it('returns null for invalid dates and ISO string for valid ones', () => {
    expect(toIsoDateOrNull('2026-04-04')).toMatch(/^2026-04-04T/);
    expect(toIsoDateOrNull('not-a-date')).toBeNull();
    expect(toIsoDateOrNull(undefined)).toBeNull();
  });

  it('escapes dangerous characters in JSON-LD output', () => {
    const output = toJsonLd({ script: '<script>alert(1)</script>' });
    expect(output).toContain('\\u003cscript>');
    expect(output).not.toContain('<script>');
  });
});
