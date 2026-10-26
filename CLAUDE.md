# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Docb is a frontend-only markdown reader: it lists a GitHub user's repositories, builds a sidebar menu from the `*.md` files in a chosen repository, and renders them. There is no backend; everything talks directly to the GitHub REST API from the browser. It is built on [react-boilerplate-cra-template](https://github.com/react-boilerplate/react-boilerplate-cra-template) (CRA 4, React 16, TypeScript, Redux Toolkit, redux-saga, styled-components, Bootstrap 5 beta).

## Commands

Package manager is yarn (`yarn.lock`).

- `yarn start`: dev server (`.env.local` sets `BROWSER=none`, so no browser opens)
- `yarn build`: production build into `build/`
- `yarn test`: Jest via react-scripts, in watch mode. Use `CI=true yarn test` for a single run.
- Single test file: `CI=true yarn test src/store/__tests__/reducer.test.ts` (or `-t "<name>"` to filter by test name)
- `yarn checkTs`: type check (`tsc --noEmit`)
- `yarn lint` / `yarn lint:fix`: ESLint (react-app + prettier) over `src`
- `yarn generate`: plop scaffolding for a new `component` or `container` (see below)
- `yarn extract-messages`: scan for i18n keys into `src/locales`

The husky pre-commit hook runs `yarn run checkTs` and then lint-staged (`eslint --fix` on `src/**/*.{ts,tsx,js,jsx}`, `prettier --write` on md/json). Prettier: 100 cols, single quotes, trailing commas, `arrowParens: avoid`.

Deployment: GitHub Actions deploys `build/` to Firebase Hosting (project `docb-md`) on push to `main`, and a preview channel on each PR. `firebase.json` rewrites all routes to `index.html` for client-side routing.

## Architecture

### Imports and state wiring

`tsconfig.json` sets `baseUrl: ./src`, so imports are absolute from `src` (`app/...`, `utils/...`, `store/...`, `types/...`).

The store starts with no reducers. Each container injects its own slice and saga at render time with `useInjectReducer` / `useInjectSaga` from `utils/redux-injectors` (a typed wrapper around `redux-injectors`). Because of that, every slice key must also be declared manually in `src/types/RootState.ts`. The `// [IMPORT NEW CONTAINERSTATE ABOVE]` and `// [INSERT NEW REDUCER KEY ABOVE]` marker comments are used by the plop container generator; keep them intact.

A container follows the boilerplate layout: `index.tsx`, `slice.ts`, `saga.ts`, `selectors.ts`, `types.ts`, `messages.ts`, `Loadable.ts`. Slices use the `createSlice` wrapper in `utils/@reduxjs/toolkit` (which constrains `name` to a `RootState` key), except `DocViewer/slice.ts`, which imports it from `@reduxjs/toolkit` directly. Many slice reducers are empty and exist only as action types that sagas listen for (e.g. `openBook`, `fetchBigChapter`, `fetchBookCollection`); the saga does the work and dispatches a real state-updating action.

### Routes and domain vocabulary

Routes are in `src/app/index.tsx`. The code uses a "library / book / chapter" metaphor:

- `/` (`HomePage`): enter a GitHub username (remembered in localStorage) plus a few hardcoded featured orgs.
- `/viewer/:provider/:username`: the user is a "library"; `DocViewer` renders `BookCollection`, a paginated list of the user's repos.
- `/viewer/:provider/:username/:repository`: a repo is a "book"; the sidebar is built from its markdown files.
- `/viewer/:provider/:username/:repository/:base64FilePath`: an md file is a "chapter". The path segment is `encodeURIComponent(btoa(filePath))`.

`provider` is only ever `github` today; gitlab is mentioned in comments but not implemented.

### DocViewer flow (the core of the app)

`src/app/containers/DocViewer/saga.ts` drives everything, and the flow is documented at the top of `DocViewer/index.tsx`:

1. `openBook` stores the selected book. If the menu is empty it runs `fetchBigChapter`, which calls GitHub code search (`/search/code?q=extension:md repo:user/repo`) and turns the file paths into a tree of `MenuItem`s (`createMenuItemFromFilePath`). Top-level files go under a synthetic `@introduction` branch (`ROOT_ID`).
2. `fetchMdContent` looks up the `MenuItem` by file path, fetches the blob from its `git_url`, base64-decodes it, and `convertMdToHtml` posts it to GitHub's `/markdown` endpoint to get HTML.
3. `MdViewer` renders the HTML with `dangerouslySetInnerHTML` and calls `afterRender`, which triggers `buildMenuItemsFromHtml`: it scrapes `h1` to `h6` from the `#id-md-viewer` element and attaches them as `hash` children of the active chapter.

Menu tree storage is split in two:

- The full tree (`MenuItem` with `parentId` / `childIds`, types `branch` | `file` | `hash`) lives in IndexedDB via Dexie (`src/store/db.ts`, table `menuItems`).
- Redux `menuItems` holds only the currently visible, flattened list. Expanding a node queries Dexie for children (`findChildItems`) and splices them in after the parent (`showChildItems`); collapsing removes descendants (`hideChildItems`). `SidebarMenu` renders this flat list using `level` for indentation.

Menu item IDs are raw file paths (leaves) or single path segments (branches), and the Dexie database is not scoped per repository.

### Caching and GitHub access

- `utils/githubApi` wraps `utils/fetchCache`, which caches JSON responses in **sessionStorage**, keyed by URL plus a sha256 of the request options.
- The markdown-to-HTML conversion caches in **localStorage** instead (`githupConverter` in the DocViewer saga).
- All GitHub calls are unauthenticated, so they are subject to GitHub's anonymous rate limits.

### Tests

Only boilerplate tests exist (`src/locales`, `src/store`, `src/styles`). `package.json` declares a 90% global coverage threshold, which the current code does not meet, so `yarn test --coverage` will fail on thresholds.
