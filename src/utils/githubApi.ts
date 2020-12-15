import fetchCache from './fetchCache';

export default function githubApi(path: string, options: RequestInit = { method: 'GET' }) {
  return fetchCache(`https://api.github.com${path}`, {
    method: options.method,
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });
}
