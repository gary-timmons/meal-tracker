# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Stack

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS v4** via PostCSS
- **React 19**

## Architecture

This project uses the Next.js App Router. All routes live under [src/app/](src/app/) as `page.tsx` files. Layouts wrap pages via `layout.tsx`. There are no API routes, database, or auth layers yet — this is a blank scaffold awaiting meal-tracking feature development.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
