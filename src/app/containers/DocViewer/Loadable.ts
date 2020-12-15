/**
 *
 * Asynchronously loads the component for DocViewer
 *
 */

import { lazyLoad } from 'utils/loadable';

export const DocViewer = lazyLoad(
  () => import('./index'),
  module => module.DocViewer,
);
