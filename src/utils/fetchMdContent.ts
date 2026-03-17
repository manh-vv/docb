import fetchCache from './fetchCache';

export default function fetchMdContent(uri: string) {
  return fetchCache(uri, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github.v3.raw',
      'Content-Type': 'text/plain',
    },
  });
}
