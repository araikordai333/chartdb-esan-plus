# AGENTS.md

A concise handbook for automated coding agents working in this repository. If multiple AGENTS.md files exist, the most specific (closest to the files you’re editing) takes precedence. If present, also respect `.cursorrules` and `CLAUDE.md`. Use this root file as the default.

## Scope and operating rules

- Prefer small, focused changes with clear intent. Preserve public APIs and existing style.
- Search upward for a more nested AGENTS.md before editing. The nearest one wins.
- Don’t introduce new dependencies unless necessary. If added, pin versions and update `package.json`.
- Run validation before finishing: lint, tests, typecheck, and a quick build.
- Avoid committing secrets. Use environment variables for any credentials.

## Repository map (where to work)

- `src/` (primary)
  - `app.tsx`, `main.tsx`: application shell and bootstrap.
  - `router.tsx`: route definitions (React Router v7). Add pages here.
  - `components/`: reusable UI (Radix UI + Tailwind). Prefer composing existing primitives.
  - `hooks/`: reusable React hooks.
  - `pages/`: route-level pages. Co-locate page-specific components when reasonable.
  - `dialogs/`, `context/`, `helmet/`: UI concerns (dialogs), React contexts, and document head management.
  - `i18n/`: translations and i18next setup. New user-facing strings must be internationalized.
  - `lib/`: framework-agnostic utilities and helpers.
  - `assets/`: images and static assets imported by code.
  - `templates-data/`: data used to render templates/examples.
  - `test/` and `src/test/setup.ts`: Vitest + Testing Library setup (happy-dom).
- `public/`: static files served as-is (e.g., `config.js`, `favicon.ico`, images). Don’t import from code using aliases.
- `vite.config.ts`: build and alias config. Alias `@` => `./src`.
- `vitest.config.ts`: test environment and path aliases.
- `eslint.config.mjs`: lint rules (ESLint Flat config). Enforces consistent type imports and a11y.
- `tailwind.config.js`, `postcss.config.js`: styling and utility classes.
- `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`: high-level docs and contribution flow.

## Code and style guidelines

- Language/stack: TypeScript + React 18, Vite, Tailwind CSS, Radix UI.
- Imports: Prefer type-only imports where applicable to satisfy `@typescript-eslint/consistent-type-imports`.
- Components: Use functional components and hooks. Reuse primitives in `src/components`. Avoid inline styles; use Tailwind.
- Accessibility: Fix `eslint-plugin-jsx-a11y` issues. Keep interactive elements keyboard-accessible.
- State: Prefer local component state and custom hooks in `src/hooks/`. Avoid global state unless necessary.
- Routing: Add/update routes in `src/router.tsx`. Co-locate loaders/actions if used.
- i18n: Any new user-facing string should be in i18next resources. Don’t hardcode literals in components.
- Tests: Use Vitest + Testing Library. Add tests for new behavior and bug fixes.
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for utilities/hooks. Tests: `*.test.ts(x)` next to the file or under `src/test/`.

## Validation checklist (run before completion)

- Lint and format (no warnings allowed by CI settings):
  ```bash
  npm run lint
  # optionally auto-fix
  npm run lint:fix
  ```
- Unit tests and coverage:
  ```bash
  npm test
  # or for CI-like run
  npm run test:ci
  # coverage (optional)
  npm run test:coverage
  ```
- Typecheck and build:
  ```bash
  npm run build
  # dev server for smoke testing
  npm run dev
  # production preview (after build)
  npm run preview
  ```

## Environment and secrets

- AI features (optional) require one of:
  - `VITE_OPENAI_API_KEY` (OpenAI-compatible key), or
  - `VITE_OPENAI_API_ENDPOINT` + `VITE_LLM_MODEL_NAME` (custom inference server)
- Privacy/analytics:
  - Set `DISABLE_ANALYTICS=true` at runtime, or `VITE_DISABLE_ANALYTICS=true` at build time to disable analytics.
- Docker examples (optional): see `README.md` for build/run with `OPENAI_API_KEY`, `OPENAI_API_ENDPOINT`, and `LLM_MODEL_NAME`.

## Testing guidance

- Runner: Vitest (`happy-dom` environment). Config in `vitest.config.ts`.
- Utilities: Testing Library (`@testing-library/react`, `@testing-library/user-event`), Jest-DOM matchers.
- Setup file: `src/test/setup.ts` is auto-loaded; put global test setup there.
- Write at least a happy-path test and one edge-case for public behavior changes.

## Build and assets

- Alias `@` to `src` (e.g., `import { Foo } from '@/components/foo'`).
- Asset hashing is customized in `vite.config.ts` for certain template assets; preserve this behavior when adding assets.
- `rollup-plugin-visualizer` is configured (output to `./stats/stats.html`). Don’t commit large reports unless needed.

## Migrations

- Current migrations: none explicitly tracked here.
- If you start or continue a migration (e.g., component library, routing changes, data model), document the scope, target, and done criteria in a nested `src/<area>/AGENTS.md` and reference it from PRs.

## Contribution workflow (brief)

- Branch from `main`. Keep changes scoped and reversible.
- Follow `CONTRIBUTING.md` for PR etiquette. Reference issues when applicable.
- Update docs (README/AGENTS.md/i18n) when changing user-visible behavior.
- Add/adjust tests. Keep CI green: lint, tests, build.

## Agent success criteria

- The change is applied in correct directories and follows repo conventions.
- Lint/test/build pass and there are no type errors.
- Public behavior is covered by tests or existing tests remain valid.
- No secrets or unrelated changes are introduced.
