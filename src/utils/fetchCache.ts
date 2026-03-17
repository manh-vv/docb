import sha256 from 'crypto-js/sha256';
import getStorage from './getStorage';

export default function fetchCache(input: string, init?: RequestInit) {
  let strOption = '';

  if (init) {
    strOption = sha256(JSON.stringify(init));
  }

  const key = `fetch-cache:${input}/${strOption}`;

  const data = getStorage().getItem(key);

  if (data) {
    try {
      return Promise.resolve(JSON.parse(data));
    } catch {
      // If data is not JSON, return it as plain text
      return Promise.resolve(data);
    }
  }

  // Check if the request expects a non-JSON response
  const acceptHeader = init?.headers?.['Accept'] || init?.headers?.['accept'];
  const isRawContent = acceptHeader === 'application/vnd.github.v3.raw';

  return fetch(input, init)
    .then(res => {
      if (isRawContent) {
        return res.text();
      }
      return res.json();
    })
    .then(res => {
      getStorage().setItem(key, JSON.stringify(res));
      return res;
    });
}
