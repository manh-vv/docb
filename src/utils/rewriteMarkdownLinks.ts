import removeLastSlash from './removeLastSlash';

export interface ChapterLocation {
  provider: string;
  username: string;
  repository: string;
  /** path of the rendered file in the repository */
  path: string;
}

const ABSOLUTE_URL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

/** Resolve `target` against the folder of the file at `from`; a leading slash means the repo root */
export function resolveRepoPath(from: string, target: string): string {
  const parts = target.startsWith('/') ? [] : from.split('/').slice(0, -1);
  for (const part of target.split('/')) {
    if (part === '..') {
      parts.pop();
    } else if (part && part !== '.') {
      parts.push(part);
    }
  }
  return parts.join('/');
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

/** GitHub prefixes heading and footnote ids with `user-content-` and maps plain fragments with JS */
function anchor(fragment: string): string {
  return fragment.startsWith('user-content-') ? fragment : `user-content-${fragment}`;
}

/**
 * GitHub's markdown API leaves relative URLs as written, which would resolve against docb itself.
 * Point them at the repository instead: `.md` files open in the reader (`data-route` holds the
 * router path for in-app navigation), other files open on GitHub, images load from
 * raw.githubusercontent.com, and in-page fragments target the ids GitHub renders.
 */
export function rewriteMarkdownLinks(html: string, at: ChapterLocation): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const repo = `${at.username}/${at.repository}`;
  const basename = removeLastSlash(import.meta.env.BASE_URL);

  doc.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href') as string;

    if (href.startsWith('#')) {
      a.setAttribute('href', `#${anchor(safeDecode(href.slice(1)))}`);
      return;
    }
    if (ABSOLUTE_URL.test(href)) {
      return;
    }

    const [pathPart, fragment] = href.split('#');
    const target = resolveRepoPath(at.path, safeDecode(pathPart.split('?')[0]));

    if (/\.md$/i.test(target)) {
      try {
        const hash = fragment ? `#${anchor(safeDecode(fragment))}` : '';
        const route = `/viewer/${at.provider}/${repo}/${encodeURIComponent(btoa(target))}${hash}`;
        a.setAttribute('href', `${basename}${route}`);
        a.setAttribute('data-route', route);
        return;
      } catch {
        // btoa only takes Latin-1 paths; fall back to the file on GitHub
      }
    }

    a.setAttribute('href', `https://github.com/${repo}/blob/HEAD/${encodePath(target)}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  doc.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src') as string;
    if (ABSOLUTE_URL.test(src)) {
      return;
    }
    const target = resolveRepoPath(at.path, safeDecode(src.split(/[?#]/)[0]));
    img.setAttribute('src', `https://raw.githubusercontent.com/${repo}/HEAD/${encodePath(target)}`);
  });

  return doc.body.innerHTML;
}
