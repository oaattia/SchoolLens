# SchoolLens

> افهم آراء أولياء الأمور عن المدارس في مصر.

SchoolLens is a public **Arabic RTL** website for parents in Egypt to understand what other parents are saying about schools. It is **not** a school ranking system — it surfaces anonymized parent voices (collected by a separate agent called **Hermes**) and summarizes them by topic and sentiment.

**Core principle:** every insight shown on the site states how many parent comments it is based on. We explain what parents are saying; we do not rank schools.

---

## Table of contents

- [Overview](#overview)
- [Quick start](#quick-start)
- [Hosting on Proxmox](#hosting-on-proxmox)
- [The public website](#the-public-website)
- [Hermes integration (API)](#hermes-integration-api)
  - [Authentication](#authentication)
  - [Ingest a comment](#ingest-a-comment)
  - [Idempotency](#idempotency)
  - [School resolution](#school-resolution)
  - [Topic reference](#topic-reference)
  - [Sentiment reference](#sentiment-reference)
  - [Status codes](#status-codes)
  - [Public read API](#public-read-api)
  - [OpenAPI spec](#openapi-spec)
  - [End-to-end test script](#end-to-end-test-script)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Architecture decisions](#architecture-decisions)
- [Privacy](#privacy)
- [Configuration](#configuration)
- [Commands](#commands)
- [Roadmap](#roadmap)

---

## Overview

A parent comes to SchoolLens to:

1. Search for a school.
2. Open the school's page.
3. Quickly understand what parents like about the school.
4. See the most common complaints.
5. See sentiment by topic.
6. Read the anonymized parent comments behind the analysis.

The end-to-end flow is:

```
Hermes (Facebook collector + analyzer)
   │  POST /api/internal/comments  (x-api-key auth, idempotent)
   ▼
SchoolLens DB (Prisma + SQLite)
   │  analyzeComments() at read time
   ▼
Arabic RTL dashboard (homepage + school page)
```

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite.

---

## Quick start

### Prerequisites
- Node.js 20+ and npm

### Setup
```bash
cd /Users/oaattia/Code/SchoolLens

# install dependencies
npm install

# create the SQLite database + tables
npx prisma db push

# generate the Prisma client
npx prisma generate

# seed demo data (3 schools, 60 Arabic comments)
npm run prisma:seed
```

### Run
```bash
npm run dev
# open http://localhost:3000
```

You should see the homepage with three schools. Click any school to see its analysis page.

### Verify the Hermes API works
```bash
curl -X POST http://localhost:3000/api/internal/comments \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-secret-change-me" \
  -d '{
    "source": "facebook",
    "external_id": "comment_12345",
    "school": "Metropolitan School Cairo",
    "comment": "ابني هناك من سنتين ومستوى الانجليزي ممتاز",
    "topic": "english",
    "sentiment": "positive",
    "date": "2026-10-01"
  }'
# → {"ok":true,"id":"...","schoolId":"...","created":true}
```

---

---

## Hosting on Proxmox

SchoolLens ships with everything needed to run as a Docker container inside a Proxmox LXC: a multi-stage `Dockerfile`, `docker-compose.yml`, and an entrypoint that handles DB migrations + first-run seeding.

**Full step-by-step guide: [`HOSTING.md`](HOSTING.md)** — creating the Debian LXC, enabling Docker inside it, building the image, configuring the API key, and day-to-day operations.

The short version:

```bash
# on the LXC, inside the project dir
openssl rand -hex 32  # generate a real API key
echo "SCHOOLLENS_INTERNAL_API_KEY=<that key>" > .env
docker compose up -d --build
# → http://<lxc-ip>:3000
```

The SQLite database lives on a Docker named volume (`schoollens-data`), so comments survive container rebuilds. When you have a domain, `HOSTING.md` includes a Caddy block for automatic HTTPS.

---

## The public website

### Homepage (`/`)
- SchoolLens branding + Arabic tagline `افهم آراء أولياء الأمور عن المدارس`.
- A large search field with placeholder `ابحث عن مدرسة` that filters the grid client-side by school name (Arabic + English) and location.
- A responsive grid of school cards (1 col mobile, 2 tablet, 3 desktop). Each card shows: school name, location, comment count, overall sentiment badge (`إيجابي غالبًا` / `آراء مختلطة` / `سلبي غالبًا`), and a slim sentiment bar.
- A footer note: `هذا الموقع يعرض آراء أولياء الأمور المنشورة علنًا، وليس تصنيفًا رسميًا للمدارس.`

### School page (`/schools/[slug]`)
- **Header** — school name, English name, location, and `تحليل مبني على X رأيًا من أولياء الأمور`.
- **Parent summary** (`ملخص آراء الأهالي`) — a highlighted callout with an auto-generated Arabic summary, always citing the comment count.
- **Sentiment distribution** (`توزيع الآراء`) — a stacked bar with positive/neutral/negative percentages and `بناءً على X رأيًا`.
- **What parents like** (`ماذا يحب الأهالي`) — top topics by positive count, each with its positive-comment count.
- **Common complaints** (`الشكاوى الشائعة`) — top topics by negative count, each with its negative-comment count.
- **Topics** (`الآراء حسب الموضوع`) — a grid of topic cards. Each shows count, a slim sentiment bar, and a short summary. Clicking a topic filters the comments below.
- **Comments** — anonymized list with Topic / Sentiment / Date filters. Each comment shows `رأي أحد أولياء الأمور`, the text, a topic pill, a sentiment pill, and an Arabic-formatted date.

---

## Hermes integration (API)

Hermes is the separate agent that collects Facebook posts and comments, analyzes them (topic + sentiment), and sends them to SchoolLens. SchoolLens exposes one private ingest endpoint and one public read endpoint.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/internal/comments` | `POST` | `x-api-key` header | Ingest one analyzed parent comment (idempotent) |
| `/api/schools` | `GET` | none | Public list of schools with sentiment summary |

### Authentication

All `/api/internal/*` endpoints require an API key in the `x-api-key` header:

```
x-api-key: <SCHOOLLENS_INTERNAL_API_KEY>
```

The key is configured on the SchoolLens server via the `SCHOOLLENS_INTERNAL_API_KEY` environment variable. Generate a strong key for production:

```bash
openssl rand -hex 32
```

- Missing or mismatched key → `401 {"error":"unauthorized"}`
- Server key not configured → `500 {"error":"server misconfiguration: API key not set"}`

### Ingest a comment

`POST /api/internal/comments`

**Request body** (`application/json`):

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes | Where the comment came from, e.g. `facebook`. |
| `external_id` | string | yes | The comment's unique id from the source system (e.g. Facebook comment id). Together with `source` this is the idempotency key. |
| `school` | string | yes | School name. Matched case-insensitively; auto-created if new. |
| `comment` | string | yes | The original parent comment text (Arabic), stored verbatim. |
| `topic` | string (enum) | yes | One of the [canonical topics](#topic-reference). |
| `sentiment` | string (enum) | yes | `positive`, `neutral`, or `negative`. |
| `date` | string (date) | no | `YYYY-MM-DD` or ISO 8601. Defaults to the current time. |

**Example:**
```bash
curl -X POST http://localhost:3000/api/internal/comments \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-secret-change-me" \
  -d '{
    "source": "facebook",
    "external_id": "comment_12345",
    "school": "Metropolitan School Cairo",
    "comment": "ابني هناك من سنتين ومستوى الانجليزي ممتاز",
    "topic": "english",
    "sentiment": "positive",
    "date": "2026-10-01"
  }'
```

**Response** (`200`, `application/json`):

| Field | Type | Description |
|---|---|---|
| `ok` | boolean | Always `true` on success. |
| `id` | string | The SchoolLens comment id (cuid). |
| `schoolId` | string | The SchoolLens school id the comment was attached to. |
| `created` | boolean | `true` if a new row was inserted, `false` if an existing row was updated (re-send). |

```json
{ "ok": true, "id": "cmuy...", "schoolId": "cmuy...", "created": true }
```

### Idempotency

The endpoint is idempotent on the composite key `(source, external_id)`. Sending the same comment again **updates the existing row in place** (text, topic, sentiment, date, school) and returns `"created": false`. It never creates a duplicate. This lets Hermes safely re-process or replay comments.

### School resolution

The `school` field is matched against existing schools case-insensitively. If no school matches, SchoolLens **creates a stub school** (with an empty location, to be enriched later) and attaches the comment to it. So Hermes can send comments for schools that have not been seeded yet.

### Topic reference

Comments are classified into exactly one topic. Valid `topic` values:

| Key | Arabic label (shown on site) |
|---|---|
| `academics` | المستوى الدراسي |
| `teachers` | المدرسين |
| `english` | الإنجليزي |
| `administration` | الإدارة |
| `communication` | التواصل |
| `fees` | المصاريف |
| `transport` | الباص |
| `activities` | الأنشطة |
| `class_size` | كثافة الفصول |
| `bullying` | التنمر |
| `cleanliness` | النظافة |
| `discipline` | الانضباط |
| `homework` | الواجبات |
| `academic_pressure` | الضغط الدراسي |

### Sentiment reference

| Value | Arabic label |
|---|---|
| `positive` | إيجابي |
| `neutral` | محايد |
| `negative` | سلبي |

### Status codes

| Status | Meaning |
|---|---|
| `200` | Ingested (check `created` for new vs updated). |
| `400` | Validation error — see the `error` field for which field is invalid. |
| `401` | Missing or incorrect `x-api-key` header. |
| `500` | Server misconfiguration — API key env var not set. |

### Public read API

`GET /api/schools` — no auth. Returns a JSON array of schools with summary analysis (no individual comments):

```json
[
  {
    "id": "cmuy...",
    "name": "Metropolitan School Cairo",
    "arabicName": "ميتروبوليتان سكول القاهرة",
    "slug": "metropolitan-school-cairo",
    "location": "القاهرة الجديدة، التجمع الخامس",
    "commentCount": 20,
    "overall": "mixed",
    "overallLabel": "آراء مختلطة",
    "sentiment": { "positivePct": 45, "neutralPct": 25, "negativePct": 30, "total": 20 }
  }
]
```

`overall` is `mostly_positive` (positives > negatives × 1.5), `mostly_negative` (the reverse), or `mixed`.

### OpenAPI spec

The full machine-readable API spec is at **[`openapi.yaml`](openapi.yaml)** (OpenAPI 3.1.0). Hermes (or any client) can consume it to generate types, clients, or mocks:

```bash
# validate it parses
python3 -c "import yaml; yaml.safe_load(open('openapi.yaml'))"

# generate a TypeScript client (example with openapi-typescript-codegen)
npx openapi-typescript-codegen --input openapi.yaml --output ./hermes-client

# or just import types
npx openapi-typescript openapi.yaml -o ./hermes-client/types.ts
```

The spec documents both endpoints, all request/response schemas, the `x-api-key` security scheme, the topic/sentiment enums, and worked examples for new-comment, replay, and new-school-auto-create cases.

### End-to-end test script

A runnable check that the ingest path works (run the dev server first):

```bash
# 1. new comment → created: true
curl -s -X POST http://localhost:3000/api/internal/comments \
  -H "Content-Type: application/json" -H "x-api-key: dev-secret-change-me" \
  -d '{"source":"facebook","external_id":"t1","school":"Metropolitan School Cairo","comment":"تجربة","topic":"english","sentiment":"positive","date":"2026-10-07"}'

# 2. same comment again → created: false (no duplicate)
curl -s -X POST http://localhost:3000/api/internal/comments \
  -H "Content-Type: application/json" -H "x-api-key: dev-secret-change-me" \
  -d '{"source":"facebook","external_id":"t1","school":"Metropolitan School Cairo","comment":"تجربة","topic":"english","sentiment":"positive","date":"2026-10-07"}'

# 3. no auth → 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/internal/comments \
  -H "Content-Type: application/json" \
  -d '{"source":"facebook","external_id":"t2","school":"x","comment":"x","topic":"english","sentiment":"positive"}'

# 4. bad topic → 400
curl -s -X POST http://localhost:3000/api/internal/comments \
  -H "Content-Type: application/json" -H "x-api-key: dev-secret-change-me" \
  -d '{"source":"facebook","external_id":"t3","school":"x","comment":"x","topic":"nope","sentiment":"positive"}'

# 5. public list
curl -s http://localhost:3000/api/schools
```

---

## Data model

Defined in [`prisma/schema.prisma`](prisma/schema.prisma). Minimal by design — add fields only when clearly needed.

### `School`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key. |
| `name` | String | English name, used for Hermes matching. |
| `arabicName` | String? | Arabic display name, shown first if present. |
| `slug` | String | URL slug, unique. |
| `location` | String | Arabic location string. Empty for stub schools created by Hermes. |
| `createdAt` | DateTime | Auto. |
| `updatedAt` | DateTime | Auto. |

### `Comment`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key. |
| `externalId` | String | The id from the source system. |
| `source` | String | e.g. `facebook`. |
| `schoolId` | String | FK → `School.id` (cascade delete). |
| `text` | String | Original comment text, stored verbatim. |
| `topic` | String | One of the [canonical topics](#topic-reference). |
| `sentiment` | String | `positive` / `neutral` / `negative`. |
| `publishedAt` | DateTime | When the comment was originally published. |
| `createdAt` | DateTime | Auto. |

**Constraints & indexes:**
- `@@unique([source, externalId])` — the idempotency key.
- `@@index([schoolId])`, `@@index([schoolId, topic])`, `@@index([schoolId, sentiment])` — for the school page queries.

### Seed data
[`prisma/seed.ts`](prisma/seed.ts) seeds 3 real Egyptian schools with 60 realistic Egyptian-Arabic parent comments spread across 14 topics and 3 sentiments, dated across 2026. It is clearly demo data (`source = "facebook"`, external ids prefixed `fb_`). Re-running the seed clears and rebuilds the data.

---

## Project structure

```
SchoolLens/
├── README.md                      # this file
├── openapi.yaml                   # OpenAPI 3.1 spec for the API (Hermes contract)
├── .env.example                   # SCHOOLLENS_INTERNAL_API_KEY, DATABASE_URL
├── prisma/
│   ├── schema.prisma              # School + Comment models
│   └── seed.ts                    # 3 schools, 60 Arabic comments
├── src/
│   ├── app/
│   │   ├── layout.tsx             # <html lang="ar" dir="rtl"> + Arabic fonts
│   │   ├── globals.css            # Tailwind + font imports
│   │   ├── page.tsx               # Homepage (server component)
│   │   ├── schools/[slug]/page.tsx   # School page (server component)
│   │   └── api/
│   │       ├── schools/route.ts            # GET public schools list
│   │       └── internal/comments/route.ts  # POST Hermes ingest (auth + idempotent)
│   ├── components/
│   │   ├── SiteHeader.tsx
│   │   ├── SchoolCard.tsx
│   │   ├── SchoolSearch.tsx       # client: filters school grid
│   │   ├── SentimentBar.tsx       # stacked positive/neutral/negative bar
│   │   ├── TopicCard.tsx
│   │   ├── SchoolDashboard.tsx    # client: topics + comments shared state
│   │   ├── CommentList.tsx        # client: topic/sentiment/date filters
│   │   └── CommentItem.tsx
│   └── lib/
│       ├── prisma.ts              # PrismaClient singleton
│       ├── types.ts               # Sentiment, TopicKey, ALL_TOPICS, Arabic labels
│       ├── analysis.ts            # analyzeComments() → dashboard data
│       ├── data.ts                # listSchools, getSchoolBySlug, getCommentsForSchool, slugify
│       └── validation.ts          # Hermes payload validation
└── prisma/dev.db                  # SQLite database (gitignored)
```

---

## Architecture decisions

1. **Next.js App Router + SQLite + Prisma in one process.** Single deployable, no separate API server or queue. Matches the "don't over-engineer" brief and the simple Hermes ingest requirement. SQLite keeps ops trivial for an MVP.
2. **Idempotent ingest via `upsert` on `(source, externalId)`.** Hermes can re-send the same comment safely; no dedup queue needed. The `created` flag tells Hermes whether it was new.
3. **Analysis is computed at read time, not stored.** `analyzeComments()` runs over fetched comment rows on every page/API request. For an MVP with ≤ thousands of comments per school this is instant and avoids a stale-aggregate table to maintain. When volume grows, materialize per-school/topic aggregates.
4. **School auto-creation on ingest.** Hermes can send comments for schools not yet in the DB; a stub school is created (location empty) to be enriched later. This keeps the pipeline unblocked.
5. **Server components for data, client components only for interactivity.** Homepage and school page are server-rendered (DB calls server-side); only `SchoolSearch`, `SchoolDashboard` (topics→comments filter state), and `CommentList` are client components. Keeps the bundle small and SEO-friendly.
6. **No external chart library.** The sentiment bar is a 3-segment flexbox — cheaper than a chart dep and sufficient for a single stacked bar.
7. **OpenAPI as the Hermes contract.** `openapi.yaml` is the single source of truth for the API so Hermes can generate types/clients instead of hand-rolling requests.
8. **Privacy by construction.** The `Comment` model stores only `text`, `topic`, `sentiment`, `publishedAt`, and `source`/`externalId`. No parent names, profile URLs, pictures, or group names are stored or displayed. The UI always shows the anonymous label `رأي أحد أولياء الأمور`.

---

## Privacy

SchoolLens stores and displays **no personal information** about the parents who wrote the comments. Specifically, it does **not** store or show:

- Parent names
- Facebook profile URLs
- Profile pictures
- Facebook group names
- Any other personally identifying information

Every comment is displayed under the anonymous label `رأي أحد أولياء الأمور`. Only the comment text, its analyzed topic, its sentiment, and its publish date are shown.

---

## Configuration

Environment variables (see [`.env.example`](.env.example)):

| Variable | Purpose | Default in `.env` |
|---|---|---|
| `SCHOOLLENS_INTERNAL_API_KEY` | API key Hermes must send via `x-api-key` | `dev-secret-change-me` (change in production) |
| `DATABASE_URL` | Prisma datasource | `file:./dev.db` |

Generate a real key for production:
```bash
openssl rand -hex 32
```

---

## Commands

```bash
# development
npm run dev                # start dev server at http://localhost:3000

# database
npx prisma db push         # create/apply schema to SQLite
npx prisma generate        # regenerate Prisma client after schema changes
npm run prisma:seed        # seed 3 schools + 60 comments (clears existing data)
npx prisma studio          # browse the DB at http://localhost:5555

# production
npm run build              # production build
npm run start              # run production server

# quality
npm run lint               # eslint
npm run format             # prettier
npm run format:check       # prettier check without writing
```

---

## Roadmap

Roughly in priority order:

1. **Batch ingest** — `POST /api/internal/comments/batch` so Hermes can send many comments per request, plus a `school` normalization layer (aliases: "Metropolitan", "Metropolitan School", "Metropolitan Cairo" → same school).
2. **School enrichment** — an admin/import endpoint to set `arabicName`, `location`, curriculum (IB/British/American), language, fee band, and to merge stub schools created by Hermes.
3. **Persistent aggregation** — once comment volume grows past a few thousand per school, materialize `SchoolTopicStat` rows (updated on ingest) instead of recomputing at read time.
4. **Smarter analysis** — replace the template-based `parentSummary` / `topicSummary` with LLM-generated Arabic summaries from the actual comment texts, and extract concrete strength/complaint phrases ("مستوى الإنجليزي ممتاز") instead of topic labels only.
5. **Near-duplicate detection** — minhash/simhash for comments reposted across groups with different external ids.
6. **Search UX** — server-side search with pagination, autocomplete, and filtering by location/curriculum/fee band on the homepage.
7. **Provenance & trust** — show comment date range per school, source coverage (how many groups/threads), and a confidence note when a school has very few comments.
8. **i18n fallback** — Arabic-first; add an English toggle for the labels (not the comments) for non-Arabic-speaking parents.
9. **Deployment** — Dockerfile + a managed SQLite (or Postgres) target; rotate the API key; rate-limit the ingest endpoint.
10. **Moderation** — a way to hide/report a comment that is doxxing, spam, or off-topic, without exposing the original author.