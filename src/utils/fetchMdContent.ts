import fetchCache from './fetchCache';
import { authHeaders } from './githubAuth';

export default function fetchMdContent(uri: string) {
  return fetchCache(uri, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });
}
