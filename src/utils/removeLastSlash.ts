export default function removeLastSlash(s: string): string {
  if (s && s.endsWith('/')) return s.substr(0, s.length - 1);
  return s;
}
