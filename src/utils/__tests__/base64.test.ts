import { decodeBase64Utf8, encodeBase64Utf8 } from '../base64';

describe('base64 for UTF-8', () => {
  it('decodes what GitHub sends for non-ASCII files', () => {
    // base64 of the UTF-8 bytes, as the GitHub blob API returns it
    const fromGithub = 'IyBSZWFjdCDCtyBUaeG6v25nIFZp4buHdCDwn5iACg==';
    expect(decodeBase64Utf8(fromGithub)).toBe('# React · Tiếng Việt 😀\n');
  });

  it('accepts the line breaks GitHub puts in file content', () => {
    const wrapped = btoa('a'.repeat(100)).replace(/(.{60})/g, '$1\n');
    expect(decodeBase64Utf8(wrapped)).toBe('a'.repeat(100));
  });

  it('round-trips non-ASCII paths and matches btoa for ASCII ones', () => {
    expect(decodeBase64Utf8(encodeBase64Utf8('docs/tiếng-việt.md'))).toBe('docs/tiếng-việt.md');
    expect(encodeBase64Utf8('docs/README.md')).toBe(btoa('docs/README.md'));
  });
});
