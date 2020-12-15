export default function getStorage(local: boolean = false): Storage {
  if (local) {
    return window.localStorage;
  }

  return window.sessionStorage;
}
