/**
 * Base64 for UTF-8 text. `atob` and `btoa` work on Latin-1 strings, so on their own they garble
 * non-ASCII content and throw on non-ASCII input. For ASCII the result is the same.
 */
export function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64);
  return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
}

export function encodeBase64Utf8(text: string): string {
  let binary = '';
  new TextEncoder().encode(text).forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
