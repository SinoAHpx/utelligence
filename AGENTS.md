# Repository Guidelines

## Project Structure & Module Organization
- Primary app code lives under `src/app` (Next.js App Router); server routes sit in `src/app/api` for chat and data processing.
- UI primitives reside in `src/components/ui`; feature modules such as `chat` and `data-visualization/*` group domain-specific components.
- Global state sits in `src/store`, shared types in `src/types`, and helpers in `src/utils` (`chat`, `data`, `hooks`, `mastra`).
- Place static assets in `public/`; avoid bundling runtime files from outside `src`.

## Build, Test, and Development Commands
- `bun install` — install dependencies.
- `bun run dev` — start the Turbopack dev server at `http://localhost:3000`.
- `bun run build` / `bun run start` — produce and serve the production build.
- `bun run lint` — execute Next.js lint; pair with `bunx biome check .` or `bunx biome format .` before committing.

## Coding Style & Naming Conventions
- TypeScript-first; prefer functional React components and Tailwind utility classes over ad-hoc styles.
- Biome enforces tabs (width 2), LF endings, double quotes, semicolons, trailing commas (ES5), and a 100-character line ceiling.
- Name files by responsibility (`chat-sidebar.tsx`, `data-utils.ts`); prefix reusable hooks with `use`, Zustand stores with `<Feature>Store`.
- Collocate component assets (styles, fixtures) near their source to simplify ownership.

## Testing Guidelines
- No automated suite yet; add unit/integration coverage alongside features and document manual verification in the PR.
- Name test files `<name>.test.ts[x]`; share fixtures under `src/__fixtures__` when needed.
- Exercise critical flows (chat upload, statistical analysis) locally via `bun run dev` before merging.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `refactor:`, `chore:`...) and keep messages imperative and scoped.
- Rebase on the latest `main`, ensure `bun run lint` and `bun run build` succeed, and describe schema or API impacts explicitly.
- PR descriptions should cover intent, testing evidence, linked issues, and UI screenshots/GIFs for visual updates.

## Environment & Security Notes
- Copy `.env.example` to `.env` and populate `URL`, `API_KEY`, `MODEL` before running locally.
- Keep secrets out of Git; rotate credentials immediately if an accidental commit occurs.
- Audit `src/app/api` changes for validation, rate limiting, and logging consistency before deployment.
