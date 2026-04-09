# Mazgin Nerway

Persoenliche Website und Blog mit Next.js.

## Development

```bash
npm run dev
```

## Auth & Datenbank (neu)

Installierte Basis:

- Auth.js (`next-auth` v5 beta) mit Google Provider
- Prisma + PostgreSQL Schema
- Auth-Route unter `src/app/api/auth/[...nextauth]/route.ts`
- Navbar zeigt Login/Logout via Google
- Admin-Panel unter `/admin` (nur Rolle `ADMIN`)

Wichtige Befehle:

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```

Noetige Env-Variablen (siehe `.env.local.example`):

```bash
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ADMIN_EMAILS=
DATABASE_URL=
```

Hinweis fuer Deployments (z. B. Vercel):

- Pflicht fuer Login: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `DATABASE_URL`
- Kompatible Alias-Namen werden ebenfalls akzeptiert:
  `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Die Variablen muessen in der jeweiligen Umgebung gesetzt sein (`Production`, optional `Preview`).
- Wenn beim Login `Fehler 400: invalid_request` mit `Missing required parameter: client_id` erscheint:
  In der aktiven Umgebung fehlt mindestens `AUTH_GOOGLE_ID` oder `GOOGLE_CLIENT_ID`.

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

## Impressum (Live)

Fuer einen rechtssicheren Live-Betrieb muessen diese Variablen gesetzt sein:

```bash
LEGAL_STREET=...
LEGAL_POSTAL_CODE=...
LEGAL_CITY=...
```

Wenn eine davon fehlt, zeigt die Impressum-Seite einen Hinweis an.
