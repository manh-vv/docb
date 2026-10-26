/** Encode each segment of a repository path, keeping the slashes */
export function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

/**
 * A book read from another branch than the default one carries it as `?ref=` in its reader
 * routes, before any `#fragment`
 */
export function withRef(route: string, ref?: string): string {
  if (!ref) {
    return route;
  }
  const hashAt = route.indexOf('#');
  const path = hashAt === -1 ? route : route.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : route.slice(hashAt);
  return `${path}?ref=${encodeURIComponent(ref)}${hash}`;
}

/** The repository on GitHub, or a file in it, on the given branch (the default one without) */
export function githubUrl(repo: string, ref?: string, path?: string): string {
  const base = `https://github.com/${repo}`;
  if (path) {
    return `${base}/blob/${ref ? encodePath(ref) : 'HEAD'}/${encodePath(path)}`;
  }
  return ref ? `${base}/tree/${encodePath(ref)}` : base;
}
