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
    return Promise.resolve(JSON.parse(data));
  }

  return fetch(input, init)
    .then(res => res.json())
    .then(res => {
      getStorage().setItem(key, JSON.stringify(res));
      return res;
    });
}
