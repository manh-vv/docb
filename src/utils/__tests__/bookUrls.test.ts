import { githubUrl, withRef } from '../bookUrls';

describe('withRef', () => {
  it('leaves routes on the default branch alone', () => {
    expect(withRef('/viewer/github/u/r', undefined)).toBe('/viewer/github/u/r');
  });

  it('adds the branch before the fragment', () => {
    expect(withRef('/viewer/github/u/r/abc', 'feat/x')).toBe('/viewer/github/u/r/abc?ref=feat%2Fx');
    expect(withRef('/viewer/github/u/r/abc#top', 'dev')).toBe('/viewer/github/u/r/abc?ref=dev#top');
  });
});

describe('githubUrl', () => {
  it('opens the repository, or its branch', () => {
    expect(githubUrl('u/r')).toBe('https://github.com/u/r');
    expect(githubUrl('u/r', 'feat/x')).toBe('https://github.com/u/r/tree/feat/x');
  });

  it('opens a file on the branch, or on the default one', () => {
    expect(githubUrl('u/r', undefined, 'docs/a b.md')).toBe(
      'https://github.com/u/r/blob/HEAD/docs/a%20b.md',
    );
    expect(githubUrl('u/r', 'dev', 'README.md')).toBe('https://github.com/u/r/blob/dev/README.md');
  });
});
