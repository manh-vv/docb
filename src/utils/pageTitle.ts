/**
 * The document title for a page. Builds the full string itself because react-helmet-async
 * ignores `titleTemplate` on React 19, where it leaves `<title>` to React.
 */
export default function pageTitle(title?: string): string {
  return title ? `${title} | docb` : 'docb';
}
