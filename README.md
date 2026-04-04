# Mazgin Nerway

Persoenliche Website und Blog mit Next.js.

## Development

```bash
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run validate:content
npm run test
npm run build
```

## CI Workflow

GitHub Actions führt bei Pushes/PRs den Workflow `.github/workflows/ci.yml` aus:

```bash
npm run ci:check
```

Dieser Job enthält:

- ESLint
- Content-Validation
- Unit-Tests (Vitest)
- Production-Build

## Content Workflow

1. Nutze `src/content/post-template.md` als Vorlage fuer neue Beitraege.
2. Lege neue Markdown-Dateien in `src/content/posts/` an.
3. Verwende normalisierte Slugs (`kebab-case`).
4. Pflege immer `tags`, `coverImageAlt`, `excerpt`, `date` und optional `updatedAt`.
5. Pruefe vor Commit mit `npm run validate:content`.

## Frontmatter Schema (Kurzfassung)

- `title`: 4-90 Zeichen
- `date`: `YYYY-MM-DD`
- `updatedAt` (optional): `YYYY-MM-DD`, nicht aelter als `date`
- `slug`: normalisiert (`kebab-case`)
- `category`: eine bekannte Kategorie
- `tags`: 1-8 eindeutige Strings
- `coverImage`: Pfad in `/public`, beginnend mit `/`
- `coverImageAlt`: 8-160 Zeichen
- `seoTitle` (optional): max. 65 Zeichen
- `seoDescription` (optional): 50-170 Zeichen
- `excerpt`: 40-220 Zeichen
- `published`: `true` oder `false`

## Monitoring & Betrieb

- Health Endpoint: `GET /api/health`
- Kontakt-API setzt `x-request-id` in Responses für bessere Fehleranalyse.
- Logging-Level über `.env`: `LOG_LEVEL=debug|info|warn|error`
