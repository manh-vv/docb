import fetchCache from './fetchCache';

export default function githubApi(path: string, options: RequestInit = { method: 'GET' }) {
  return fetchCache(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
    ...options,
  });
}
