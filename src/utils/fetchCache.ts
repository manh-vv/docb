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

  return fetch(input, init).then(res =>
    res.json().then(json => {
      // don't cache errors such as a rate limit, so a later retry can succeed
      if (res.ok) {
        getStorage().setItem(key, JSON.stringify(json));
      }
      return json;
    }),
  );
}
