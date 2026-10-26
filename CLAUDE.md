# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Docb is a frontend-only markdown reader: it lists a GitHub user's repositories, builds a sidebar menu from the `*.md` files in a chosen repository, and renders them. There is no backend; everything talks directly to the GitHub REST API from the browser. It started from [react-boilerplate-cra-template](https://github.com/react-boilerplate/react-boilerplate-cra-template) and now builds with Vite (React 19, React Router 8 in declarative mode, Redux Toolkit 2, redux-saga, styled-components 6, Bootstrap 5).

## Commands

Package manager is yarn 1 (`yarn.lock`). Node version is in `.nvmrc` (24; jsdom needs 24.15+).

- `yarn start`: Vite dev server at `http://localhost:5173/docb/`
- `yarn build`: production build into `build/` (also writes `build/404.html`, see Deployment)
- `yarn preview`: serve the production build
- `yarn test`: Vitest (jsdom, globals on), watch mode in a terminal. `yarn test --run` for a single run.
- Single test file: `yarn test --run src/store/__tests__/reducer.test.ts` (or `-t "<name>"` to filter by test name)
- `yarn checkTs`: type check (`tsc --noEmit`). Vite does not type-check, so run this before building.
- `yarn lint` / `yarn lint:fix`: ESLint 10 flat config (`eslint.config.mjs`: typescript-eslint, react-hooks, prettier) over `src`
- `yarn generate`: plop scaffolding for a new `component` or `container` (see below). `yarn test:generators` generates every option combination, lints and type-checks them, then cleans up.
- `yarn extract-messages`: scan for i18n keys into `src/locales`

TypeScript is pinned to 6.0.x because typescript-eslint does not support TypeScript 7 yet.

The husky pre-commit hook (`.husky/pre-commit`) runs `yarn run checkTs` and then lint-staged (`eslint --fix` on `src/**/*.{ts,tsx,js,jsx}`, `prettier --write` on md/json). Prettier: 100 cols, single quotes, trailing commas, `arrowParens: avoid`.

Deployment: `.github/workflows/deploy.yml` checks, tests and builds every PR, and on push to `main` deploys `build/` to GitHub Pages at `https://manh-vv.github.io/docb/`. Because it is a project site, `vite.config.mts` sets `base: '/docb/'` and the router uses that as its `basename`, so in-app links must go through React Router (`Link`, `navigate`); a raw `<a href="/viewer/...">` skips the base and 404s. GitHub Pages has no rewrites, so the build copies `index.html` to `404.html` to boot the SPA on deep links.

## Architecture

### Imports and state wiring

Imports are absolute from `src` (`app/...`, `utils/...`, `store/...`, `types/...`). That mapping lives in two places that must stay in sync: `paths` in `tsconfig.json` and the alias list in `vite.config.mts`. Adding a new top-level folder under `src/` means updating both.

The store starts with no reducers (root state `{}`). Each container injects its own slice and saga with `useInjectReducer` / `useInjectSaga` from `utils/redux-injectors` (a typed wrapper around `redux-injectors`). Injection happens in a layout effect, after the container's first render, so selectors must fall back to the slice's `initialState` (`state.key || initialState`). Because of that, every slice key must also be declared manually in `src/types/RootState.ts`. The `// [IMPORT NEW CONTAINERSTATE ABOVE]` and `// [INSERT NEW REDUCER KEY ABOVE]` marker comments are used by the plop container generator; keep them intact.

A container follows the boilerplate layout: `index.tsx`, `slice.ts`, `saga.ts`, `selectors.ts`, `types.ts`, `messages.ts`, `Loadable.ts`. Slices use the `createSlice` wrapper in `utils/@reduxjs/toolkit` (which constrains `name` to a `RootState` key), except `DocViewer/slice.ts`, which imports it from `@reduxjs/toolkit` directly. Many slice reducers are empty and exist only as action types that sagas listen for (e.g. `openBook`, `fetchBigChapter`, `fetchBookCollection`); the saga does the work and dispatches a real state-updating action.

### Routes and domain vocabulary

Routes are in `src/app/index.tsx`. The code uses a "library / book / chapter" metaphor:

- `/` (`HomePage`): enter a GitHub username (remembered in localStorage) plus a few hardcoded featured orgs.
- `/viewer/:provider/:username` (one route with optional `:repository?/:base64FilePath?` segments): the user is a "library"; `DocViewer` renders `BookCollection`, a paginated list of the user's repos.
- `/viewer/:provider/:username/:repository`: a repo is a "book"; the sidebar is built from its markdown files.
- `/viewer/:provider/:username/:repository/:base64FilePath`: an md file is a "chapter". The path segment is `encodeURIComponent(btoa(filePath))`.

`provider` is only ever `github` today; gitlab is mentioned in comments but not implemented.

### DocViewer flow (the core of the app)

`src/app/containers/DocViewer/saga.ts` drives everything, and the flow is documented at the top of `DocViewer/index.tsx`:

1. `openBook` stores the selected book. If the menu is empty it runs `fetchBigChapter`, which lists the repo with the git trees API (`/repos/:user/:repo/git/trees/HEAD?recursive=1`), keeps the `.md` blobs, and turns their paths into a tree of `MenuItem`s (`createMenuItemFromFilePath`). Code search is not an option: it requires authentication. Top-level files go under a synthetic `@introduction` branch (`ROOT_ID`).
2. `fetchMdContent` looks up the `MenuItem` by file path, fetches the blob from its `git_url`, base64-decodes it, and `convertMdToHtml` posts it to GitHub's `/markdown` endpoint to get HTML.
3. `MdViewer` renders the HTML with `dangerouslySetInnerHTML` and calls `afterRender`, which triggers `buildMenuItemsFromHtml`: it scrapes `h1` to `h6` from the `#id-md-viewer` element and attaches them as `hash` children of the active chapter. GitHub now renders each heading as `<div class="markdown-heading"><hN>...</hN><a class="anchor" id="user-content-...">` (the anchor used to sit inside the heading); `createMenuItemFromHTag` handles both, and headings without an anchor are skipped because Dexie needs an id. An exception in a saga task kills the whole `docViewerSaga`, after which the sidebar stops responding.

Menu tree storage is split in two:

- The full tree (`MenuItem` with `parentId` / `childIds`, types `branch` | `file` | `hash`) lives in IndexedDB via Dexie (`src/store/db.ts`, table `menuItems`).
- Redux `menuItems` holds only the currently visible, flattened list. Expanding a node queries Dexie for children (`findChildItems`) and splices them in after the parent (`showChildItems`); collapsing removes descendants (`hideChildItems`). `SidebarMenu` renders this flat list using `level` for indentation.
- Sidebar clicks go through an `actionChannel` (`watchClickOnMenuItem`) so they are handled one at a time, and `handleClickOnMenuItem` toggles from the item in the store, not the possibly stale click payload. `showChildItems` is a no-op if the parent is collapsed or its children are already shown. Overlapping clicks used to duplicate children or show them under a collapsed parent.

All books share the one Dexie table, so menu item ids are scoped by book: `github/user/repo:path/to/file.md` for files and folders (folders by full path), `github/user/repo:@introduction` for the root branch, and `<chapter id>#<anchor id>` for headings (`bookId` / `chapterId` in the saga). `openBook` reloads the menu whenever the book changes, not only when it is empty. Changing the id scheme needs a Dexie version bump that clears the table (see `store/db.ts`).

### Caching and GitHub access

- `utils/githubApi` wraps `utils/fetchCache`, which caches successful JSON responses in **sessionStorage**, keyed by URL plus a sha256 of the request options. Error responses (e.g. rate limits) are returned but not cached.
- The markdown-to-HTML conversion caches in **localStorage** instead (`githupConverter` in the DocViewer saga).
- All GitHub calls are unauthenticated, so they are subject to GitHub's anonymous rate limits. The anonymous limit is 60 requests per hour per IP.

### Tests

Tests are mostly the boilerplate ones (`src/locales`, `src/store`, `src/styles`), plus `DocViewer/__tests__/handleClickOnMenuItem.test.ts`, which runs the real slice and saga with `store/db` mocked by `vi.mock`. `vite.config.mts` keeps the old 90% global coverage threshold, which the current code does not meet, so `yarn test --run --coverage` fails on thresholds.
