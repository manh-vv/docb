import { resolveRepoPath, rewriteMarkdownLinks } from '../rewriteMarkdownLinks';

const at = { provider: 'github', username: 'u', repository: 'r', path: 'docs/guide/intro.md' };

function rewrite(html: string) {
  const el = document.createElement('div');
  el.innerHTML = rewriteMarkdownLinks(html, at);
  return el;
}

const route = (path: string) => `/viewer/github/u/r/${encodeURIComponent(btoa(path))}`;

describe('resolveRepoPath', () => {
  it('resolves against the folder of the current file', () => {
    expect(resolveRepoPath('docs/guide/intro.md', 'setup.md')).toBe('docs/guide/setup.md');
    expect(resolveRepoPath('docs/guide/intro.md', './a/b.md')).toBe('docs/guide/a/b.md');
    expect(resolveRepoPath('docs/guide/intro.md', '../../README.md')).toBe('README.md');
    expect(resolveRepoPath('docs/guide/intro.md', '/CHANGELOG.md')).toBe('CHANGELOG.md');
    expect(resolveRepoPath('README.md', 'public/sample.md')).toBe('public/sample.md');
  });
});

describe('rewriteMarkdownLinks', () => {
  it('opens relative markdown links in the reader', () => {
    const a = rewrite('<a href="../../README.md">readme</a>').querySelector('a')!;
    expect(a.getAttribute('data-route')).toBe(route('README.md'));
    expect(a.getAttribute('href')).toBe(route('README.md'));
  });

  it('keeps the fragment of a markdown link, as GitHub renders the id', () => {
    const a = rewrite('<a href="setup.md#install">x</a>').querySelector('a')!;
    expect(a.getAttribute('data-route')).toBe(
      `${route('docs/guide/setup.md')}#user-content-install`,
    );
  });

  it('points in-page fragments at the ids GitHub renders', () => {
    const el = rewrite('<a href="#install">x</a><a href="#user-content-fn-1">1</a>');
    const [plain, footnote] = el.querySelectorAll('a');
    expect(plain.getAttribute('href')).toBe('#user-content-install');
    expect(footnote.getAttribute('href')).toBe('#user-content-fn-1');
  });

  it('sends other relative files to GitHub', () => {
    const a = rewrite('<a href="../../LICENSE">license</a>').querySelector('a')!;
    expect(a.getAttribute('href')).toBe('https://github.com/u/r/blob/HEAD/LICENSE');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.hasAttribute('data-route')).toBe(false);
  });

  it('loads relative images from the repository', () => {
    const img = rewrite('<img src="img/my%20shot.png">').querySelector('img')!;
    expect(img.getAttribute('src')).toBe(
      'https://raw.githubusercontent.com/u/r/HEAD/docs/guide/img/my%20shot.png',
    );
  });

  it('leaves absolute URLs alone', () => {
    const el = rewrite(
      '<a href="https://example.com/a.md">x</a><a href="mailto:a@b.c">m</a><img src="https://camo.githubusercontent.com/x">',
    );
    const [web, mail] = el.querySelectorAll('a');
    expect(web.getAttribute('href')).toBe('https://example.com/a.md');
    expect(mail.getAttribute('href')).toBe('mailto:a@b.c');
    expect(el.querySelector('img')!.getAttribute('src')).toBe(
      'https://camo.githubusercontent.com/x',
    );
  });
});

describe('rewriteMarkdownLinks on another branch', () => {
  const onBranch = (html: string) => {
    const el = document.createElement('div');
    el.innerHTML = rewriteMarkdownLinks(html, { ...at, ref: 'feat/x' });
    return el;
  };

  it('keeps reading from the branch', () => {
    const a = onBranch('<a href="setup.md#install">x</a>').querySelector('a')!;
    expect(a.getAttribute('data-route')).toBe(
      `${route('docs/guide/setup.md')}?ref=feat%2Fx#user-content-install`,
    );
  });

  it('links files and images on the branch', () => {
    const el = onBranch('<a href="run.sh">x</a><img src="img/a.png">');
    expect(el.querySelector('a')!.getAttribute('href')).toBe(
      'https://github.com/u/r/blob/feat/x/docs/guide/run.sh',
    );
    expect(el.querySelector('img')!.getAttribute('src')).toBe(
      'https://raw.githubusercontent.com/u/r/feat/x/docs/guide/img/a.png',
    );
  });
});
