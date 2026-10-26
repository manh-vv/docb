import sha256 from 'crypto-js/sha256';
import getStorage from './getStorage';
import { HttpError } from './loadError';

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

  return fetch(input, init).then(async res => {
    // errors are thrown, not cached, so a later retry can succeed
    if (!res.ok) {
      throw await HttpError.from(res);
    }
    const json = await res.json();
    getStorage().setItem(key, JSON.stringify(json));
    return json;
  });
}
