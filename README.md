# Docb

A markdown reader for GitHub repositories that runs entirely in your browser.

Live at **https://manh-vv.github.io/docb/**

Pick a GitHub user or organization, choose one of their repositories, and docb turns the repository's `*.md` files into a book: a sidebar menu of folders, files and headings, with each file rendered as a readable page.

## Features

- **Browse any library.** Enter a GitHub username, or start from the featured accounts on the home page. Signed in users also see their own account and organizations.
- **Read repositories as books.** The sidebar is built from every markdown file in the repository, and each page's headings appear under it for quick jumps.
- **Links that work.** Relative links between markdown files stay inside the reader, other files open on GitHub, and images load from the repository.
- **Shareable URLs.** Every library, book and chapter has its own address, so deep links, bookmarks and browser history all work.
- **Themes and color modes.** Light, dark or system mode, with four themes: Indigo, Sepia, Ocean and High contrast.
- **Private repositories.** Sign in with a fine-grained personal access token (read-only `contents` access is enough) to read private repositories and get a higher API rate limit.
- **Works on phones.**

## Privacy

Docb is a static page with no server of its own.

- Repositories and files load straight from the GitHub API. Typefaces load from Google Fonts, and images from wherever a document links them.
- Settings, cached responses and your GitHub token (if you sign in) stay in your browser's storage. The token is only ever sent to `api.github.com`.
- No analytics, no ads, no cookies, and no account needed for public repositories.

Without signing in, GitHub allows 60 API requests per hour per IP address, and only public repositories are visible.

## Development

Requirements: Node 24 (see `.nvmrc`) and yarn 1.

```sh
yarn install
yarn dev          # dev server at http://localhost:5173/docb/
yarn test --run   # unit tests (Vitest)
yarn checkTs      # type check; Vite does not type-check
yarn lint         # ESLint
yarn build        # production build into build/
yarn preview      # serve the production build
```

`yarn generate` scaffolds a new component or container.

## Tech

Frontend only: React 19, React Router, Redux Toolkit with redux-saga, styled-components, Bootstrap 5, and Dexie (IndexedDB) for the menu tree, built with Vite. Markdown is rendered to HTML by GitHub's `/markdown` API.

The project started from [react-boilerplate-cra-template](https://github.com/react-boilerplate/react-boilerplate-cra-template). See [CLAUDE.md](CLAUDE.md) for an architecture walkthrough.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) checks, tests and builds every pull request, and deploys every push to `main` to GitHub Pages.
