# Kome Blog

The public-facing blog frontend for the Kome blogging platform, built with Vue 3, TypeScript, and Tailwind CSS v4.

> For overall architecture, deployment guide, and roadmap,
> see [this blog post](https://kome.km-o.com/post/kome-blog-overview).

## Related Projects

| Project       | Description                  | Repository                                       |
|---------------|------------------------------|--------------------------------------------------|
| **kome-blog** | Blog frontend (this project) | —                                                |
| kome-admin    | Admin dashboard              | [GitHub](https://github.com/km-hello/kome-admin) |
| kome-api      | Backend REST API             | [GitHub](https://github.com/km-hello/kome-api)   |

## Tech Stack

| Category   | Technologies                                |
|------------|---------------------------------------------|
| Framework  | Vue 3.5 (Composition API, `<script setup>`) |
| Language   | TypeScript 5.9 (strict mode)                |
| Build Tool | Vite 7                                      |
| Styling    | Tailwind CSS v4                             |
| State      | Pinia                                       |
| Routing    | Vue Router 4                                |
| HTTP       | Axios                                       |
| Utilities  | VueUse                                      |
| Icons      | Lucide Vue                                  |
| Toasts     | vue-sonner                                  |
| Markdown   | marked + highlight.js + KaTeX + Mermaid     |

## Features

- **Rich Markdown Rendering** — Code syntax highlighting (highlight.js with github theme), LaTeX math equations (KaTeX),
  and Mermaid diagrams with lazy loading
- **Multiple Content Types** — Blog posts with cover images, memos (micro-blog), archive timeline, and friend links
- **Auto-generated TOC** — Table of contents extracted from h2/h3 headings on post detail pages
- **Code Copy Button** — One-click copy on all code blocks with language label
- **Infinite Scroll** — Memos page loads more content as you scroll
- **Responsive Layout** — Desktop sidebar with mobile drawer, adapts across breakpoints
- **Outdated Content Alert** — Warns readers if a post hasn't been updated in 180+ days
- **SEO-friendly Slugs** — Posts accessed via readable `/post/:slug` URLs
- **Admin Live Preview** — Exposes a `/preview` route consumed by kome-admin for real-time post preview during editing

## Getting Started

### Prerequisites

- Node.js 20+
- A running [kome-api](https://github.com/km-hello/kome-api) backend

### Install & Run

```bash
git clone https://github.com/km-hello/kome-blog.git
cd kome-blog
npm install
npm run dev
```

The dev server starts at `http://localhost:5174` and proxies `/api` requests to `http://localhost:8080`.

### Commands

| Command           | Description                   |
|-------------------|-------------------------------|
| `npm run dev`     | Start dev server (port 5174)  |
| `npm run build`   | Type-check + production build |
| `npm run preview` | Preview production build      |

## Project Structure

```
src/
├── api/                # API modules (post, memo, tag, link, site)
├── request/            # Axios wrapper with response interceptor
├── composables/        # useMarkdown, useCodeCopy, useSidebarDrawer
├── components/
│   ├── common/         # AppHeader, Pagination, PageTitleCard
│   ├── post/           # PostCard
│   ├── sidebar/        # ProfileCard, SearchBox, TagList, LatestMemo, etc.
│   ├── icons/          # Custom icon components
│   └── skeleton/       # Loading skeleton components
├── views/              # Route page components
│   ├── Home.vue        # Paginated posts + sidebar
│   ├── Archive.vue     # Posts grouped by year/month
│   ├── Memos.vue       # Micro-blog with infinite scroll
│   ├── Links.vue       # Friend links directory
│   ├── PostDetail.vue  # Full article with TOC
│   └── ...
├── router/             # Vue Router config (8 routes)
├── stores/             # Pinia store (site info)
├── types/              # API response types (Result<T>, PageResult<T>)
├── style.css           # Global styles (~620 lines)
└── main.ts             # App entry point
```

## Environment Variables

| Variable               | Description                 | Default            |
|------------------------|-----------------------------|--------------------|
| `VITE_API_BASE_URL`    | Backend API base URL        | `""` (same origin) |
| `VITE_ALLOWED_ORIGINS` | Allowed origins for preview | —                  |
