# CLAUDE.md

## Project Overview

English Stack is a static educational platform for English learning. It features article reading practice with integrated vocabulary extraction, listening resources (YouTube), and full-text search. Built for Scott & Chloe.

## Technology Stack

- **Framework**: Astro 5 (static output) + Svelte 5 (interactive components)
- **Styling**: Tailwind CSS 4 + DaisyUI 5 + SASS
- **Content**: Astro content collections (`.md` files), MDX support
- **Search**: Pagefind (full-text, client-side)
- **Math**: remark-math + rehype-katex
- **Deployment**: Vercel (`@astrojs/vercel`)
- **Language**: TypeScript (strict)

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (required before search works)
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
├── assets/           # Static SVG assets
├── components/
│   ├── ArticleRelated/YouTube.svelte
│   ├── Menu/Menu.svelte + DrilldownMenu.svelte
│   ├── Search/SearchBtn.svelte + SearchPanel.svelte
│   ├── Vocab/VocabBoard.svelte
│   ├── ToeflGuard.svelte  # Password gate for TOEFL content
│   └── PostRenderer.astro
├── constants/
│   ├── authors.ts    # Author definitions
│   └── listening.ts  # YouTube resource list
├── content/
│   ├── config.ts     # Zod schemas for collections
│   ├── reading/
│   │   ├── common/   # Common vocabulary articles
│   │   └── toefl/    # TOEFL vocabulary articles
│   ├── listening/
│   │   └── toefl/    # TOEFL listening articles
│   └── speaking/
│       └── toefl/    # TOEFL speaking practice
├── layouts/Layout.astro
├── models/menu.ts
├── pages/
│   ├── index.astro
│   ├── listening.astro
│   ├── vocabularies-common.astro
│   ├── vocabularies-toefl.astro
│   └── reading/[...slug].astro  (+ writing, speaking, grammar, listening)
├── styles/main.scss + tailwind.css
└── utils/
    ├── content.ts      # Dynamic route generation
    ├── date.ts         # Date formatting (en-US)
    ├── readPath.ts     # Path normalization
    ├── useMenu.ts      # Hierarchical menu builder from collections
    └── useVocabulary.ts # Vocabulary extraction from Markdown tables
```

## Content Collections

No database — content is stored as `.md` files in `src/content/`.

**Active collections**: `reading`, `writing`, `listening`, `speaking`, `grammar`

**Schema fields** (defined in `src/content/config.ts`):
- `title` — string (optional)
- `author` — string (default: `'Jeremy'`)
- `link` — string (original article URL, optional)
- `date` — Date | string (optional)
- `sameDateSort` — number (sort priority for same-date items, optional)

### Adding a New Article

- Reading: `src/content/reading/common/` or `src/content/reading/toefl/`
- Listening: `src/content/listening/toefl/`
- Speaking: `src/content/speaking/toefl/`
- Filename convention: `YYYYMMDD.md` or `YYYYMMDD-slug.md`

```yaml
---
date: YYYY/MM/DD
title: Article Title
author: 'AuthorName'
---
```

### Vocabulary Format in Articles

Vocabulary tables are parsed automatically by `useVocabulary.ts`. Use this Markdown table format in articles:

```markdown
| word | phonetic | pos | meaning | example |
|------|----------|-----|---------|---------|
| ephemeral | /ɪˈfem.ər.əl/ | adj | lasting a very short time | ... |
```

## Path Aliases

`@/` maps to `src/` — use this for all internal imports.

```ts
import { something } from '@/utils/content'
```

## Code Style (ESLint enforced)

- Single quotes, no semicolons
- No relative parent imports (`../`) — use `@/` alias instead
- Type-safe imports

## Key Behaviors

- **Menu**: Auto-generated from content collections; hierarchical, date-sorted
- **Vocabulary Board**: Extracts from article Markdown tables; paginates 30/page; TTS pronunciation
- **Search**: Pagefind — only works after `npm run build` (not in dev)
- **PostRenderer**: Handles progress bar, anchor links, TTS buttons, copy-to-clipboard for code, changelog display. Accepts `requiresAuth?: boolean` prop — pass `true` to enable TOEFL password gate.
- **Math**: Render LaTeX with `$...$` inline and `$$...$$` block syntax
- **Admonitions**: Use `:::info`, `:::note`, `:::warning`, `:::danger`, `:::tip` directive syntax

## TOEFL Content Access Control

TOEFL content is gated behind a password prompt (`ToeflGuard.svelte`).

- **Password**: `toefl2026` (hardcoded, intentional)
- **Session**: uses `sessionStorage` — persists across refreshes, clears on tab close
- **Gated pages**:
  - `vocabularies-toefl.astro` — always gated
  - `reading/[...slug].astro` — gated when `entry.slug.startsWith('toefl/')`
  - `listening/[...slug].astro` — gated when `entry.slug.startsWith('toefl/')`
  - `speaking/[...slug].astro` — gated when `entry.slug.startsWith('toefl/')`
- To gate a new page, add `<ToeflGuard client:load />` or pass `requiresAuth={true}` to `PostRenderer`

## Authors

Defined in `src/constants/authors.ts`. Reference by name string in frontmatter.

## Deployment

Deployed to Vercel. The `@astrojs/vercel` adapter is configured with web analytics enabled.
