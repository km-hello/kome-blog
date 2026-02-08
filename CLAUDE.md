# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + TypeScript SPA blog frontend that consumes a REST API backend. Uses Vite for bundling, Tailwind CSS v4 for styling, and features sophisticated markdown rendering with code highlighting, LaTeX math, and Mermaid diagrams.

## Commands

- `npm run dev` — Start dev server on port 5174 (proxies `/api` to `http://localhost:8080`)
- `npm run build` — Type-check with vue-tsc then production build with Vite
- `npm run preview` — Preview production build locally

No test runner or linter is configured.

## Architecture

**Routing** (Vue Router, 5 routes):
- `/` — Home (paginated posts + sidebar)
- `/archive` — Posts grouped by year/month
- `/memos` — Micro-blog with infinite scroll
- `/links` — Friend links directory
- `/post/:slug` — Post detail view

**Key directories under `src/`**:
- `api/` — One module per resource (post, memo, tag, link, site), all functions suffixed with `Api`
- `request/` — Axios wrapper with 15s timeout, response interceptor checks `code === 200`, toast on errors
- `composables/` — `useMarkdown` is the core content renderer (marked + highlight.js + KaTeX + Mermaid)
- `components/common/` — Shared UI (AppHeader, Pagination, PageTitleCard)
- `components/post/` — PostCard
- `components/sidebar/` — ProfileCard, SearchBox, TagList, LatestMemo, MemoStats, TimelineNav, LinkExchange, SiteFooter
- `views/` — One page component per route
- `types/` — API response/request types; `Result<T>` and `PageResult<T>` are the standard response envelopes

**Data flow**: Views → API modules → Axios request wrapper → Backend at `/api`

## Conventions

- All components use `<script setup lang="ts">` composition API
- Path alias: `@` → `./src`
- API base URL configurable via `VITE_API_BASE_URL` env var
- `.bento-card` class for consistent card styling (white bg, border, hover shadow)
- `.scrollbar-thin` for custom thin scrollbars
- Markdown has three density variants: `.markdown-body` (full), `.markdown-compact` (memos), `.markdown-mini` (sidebar previews)
- Global styles live in `src/style.css` (~620 lines, well-commented sections)
- Tailwind utilities for layout; custom CSS in style.css for complex rendering (markdown, code blocks, tables)

## Git Branch Convention

- Feature branches: `feat/*`
- Refactor branches: `refactor/*`
- PRs merge into `main`
