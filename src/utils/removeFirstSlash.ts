export default function removeFirstSlash(s: string): string {
  if (s && s.startsWith('/')) return s.substr(1, s.length);
  return s;
}
