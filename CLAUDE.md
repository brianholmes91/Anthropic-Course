# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repo contains a single project: `uigen/` — an AI-powered React component generator built with Next.js.

## Commands (run from `uigen/`)

```bash
npm run setup       # First-time setup: install deps, generate Prisma client, run migrations
npm run dev         # Start dev server with Turbopack
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Vitest (unit tests)
npx vitest src/lib/__tests__/file-system.test.ts  # Run a single test file
npm run db:reset    # Reset database (destructive)
```

> **Windows note:** `npm run dev` fails in cmd.exe due to Unix env syntax. Run directly in bash:
> `NODE_OPTIONS='--require ./node-compat.cjs' npx next dev --turbopack`

## Environment Variables (`uigen/.env`)

```
ANTHROPIC_API_KEY=""   # Optional — app falls back to a mock provider if empty
JWT_SECRET=""          # Optional — app uses an insecure fallback if empty
```

Database is SQLite (`prisma/dev.db`), created automatically by `npm run setup`.

## Architecture

UIGen is a three-panel web app: **Chat** (left) | **Preview / Code Editor** (right). Users describe a React component in natural language; Claude generates it via streaming, and a live preview renders it instantly.

### Key Architectural Concepts

**Virtual File System** — The app never writes to disk. All component files live in an in-memory `VirtualFileSystem` class (`src/lib/file-system.ts`). This state is serialized to JSON and persisted in the SQLite `Project.data` column for authenticated users.

**AI Generation Flow**
1. User prompt → `POST /api/chat` (streaming)
2. Claude uses two tools: `str_replace_editor` (create/modify files) and `file_manager` (directory ops)
3. File system updates stream back to the client; the preview iframe re-renders

**Mock Provider** — If `ANTHROPIC_API_KEY` is absent, `src/lib/provider.ts` returns a `MockLanguageModel` that generates static example components (Counter, Form, Card). Useful for development without API costs.

**Auth** — JWT stored in an HTTP-only cookie (7-day expiry). Server Actions handle sign-up/sign-in (`src/actions/`). Passwords hashed with bcrypt. `jose` handles JWT signing.

**State Management** — Two React Contexts:
- `FileSystemContext` (`src/lib/contexts/`) — owns the `VirtualFileSystem` instance
- `ChatContext` — owns chat messages and streams from `/api/chat`

### Directory Map

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Home — redirects auth'd users to latest project, shows `MainContent` for anonymous |
| `src/app/[projectId]/` | Dynamic project route (authenticated only) |
| `src/app/api/chat/route.ts` | Streaming AI endpoint |
| `src/app/main-content.tsx` | Root layout component (resizable three-panel UI) |
| `src/components/chat/` | ChatInterface, MessageList, MessageInput, MarkdownRenderer |
| `src/components/editor/` | Monaco CodeEditor, FileTree (virtual file browser) |
| `src/components/preview/` | PreviewFrame — renders generated JSX in an iframe via Babel Standalone |
| `src/components/auth/` | AuthDialog, SignInForm, SignUpForm |
| `src/components/ui/` | shadcn/ui primitives |
| `src/lib/file-system.ts` | VirtualFileSystem class |
| `src/lib/provider.ts` | Returns real Claude or MockLanguageModel |
| `src/lib/auth.ts` | JWT session helpers |
| `src/lib/tools/` | AI tool definitions (str_replace_editor, file_manager) |
| `src/lib/prompts/` | System prompt for Claude |
| `src/lib/transform/` | JSX transformation utilities |
| `src/actions/` | Server Actions: auth + project CRUD |
| `prisma/schema.prisma` | Two models: `User`, `Project` (messages + data stored as JSON strings) |
| `src/generated/prisma/` | Auto-generated Prisma client (gitignored) |

### Data Models

The database schema is defined in `prisma/schema.prisma` — reference it any time you need to understand the structure of data stored in the database.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma + SQLite · Vercel AI SDK (`ai`) · `@ai-sdk/anthropic` · Monaco Editor · Babel Standalone · Vitest
