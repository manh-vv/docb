import { useSyncExternalStore } from 'react';
import db from 'store/db';

import { HttpError } from './loadError';

/**
 * Sign in with a GitHub personal access token. GitHub's OAuth flows need a server to exchange
 * the code for a token, and docb has none, so the token is pasted in, kept in this browser's
 * localStorage, and only ever sent to api.github.com.
 */
export const GITHUB_AUTH_KEY = 'docb:github-auth';

export interface GithubAuth {
  token: string;
  login: string;
  avatarUrl: string;
}

const listeners = new Set<() => void>();
let current: GithubAuth | null | undefined;

function load(): GithubAuth | null {
  try {
    const stored = JSON.parse(window.localStorage.getItem(GITHUB_AUTH_KEY) || 'null');
    if (stored && typeof stored.token === 'string' && typeof stored.login === 'string') {
      return stored;
    }
  } catch {
    // storage can be unavailable, e.g. blocked site data
  }
  return null;
}

export function readGithubAuth(): GithubAuth | null {
  if (current === undefined) {
    current = load();
  }
  return current;
}

/** The Authorization header for GitHub API requests, empty when signed out */
export function authHeaders(): Record<string, string> {
  const auth = readGithubAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

function save(auth: GithubAuth | null) {
  try {
    if (auth) {
      window.localStorage.setItem(GITHUB_AUTH_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(GITHUB_AUTH_KEY);
    }
  } catch {
    // the sign in then only lasts for this page view
  }
  current = auth;
  listeners.forEach(listener => listener());
}

/** Checks the token with GitHub (uncached) and remembers it with the account it belongs to */
export async function signIn(token: string): Promise<GithubAuth> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw await HttpError.from(res);
  }
  const user = await res.json();
  const auth = { token, login: user.login, avatarUrl: user.avatar_url };
  save(auth);
  return auth;
}

/** Forgets the token, and everything that may have been read from private repositories with it */
export async function signOut() {
  save(null);
  clearCachedResponses(window.sessionStorage, 'fetch-cache:');
  clearCachedResponses(window.localStorage, 'fetch:');
  await db.menuItems.clear();
}

function clearCachedResponses(storage: Storage, prefix: string) {
  try {
    Object.keys(storage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => storage.removeItem(key));
  } catch {
    // nothing was cached
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // follow sign in and sign out in other tabs
  const onStorage = (e: StorageEvent) => {
    if (e.key === GITHUB_AUTH_KEY) {
      current = load();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useGithubAuth() {
  return useSyncExternalStore(subscribe, readGithubAuth, () => null);
}
