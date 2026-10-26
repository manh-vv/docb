import fetchCache from './fetchCache';
import { authHeaders } from './githubAuth';

export default function githubApi(path: string, options: RequestInit = { method: 'GET' }) {
  return fetchCache(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      ...authHeaders(),
    },
    ...options,
  });
}
