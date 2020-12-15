/**
 *
 * Asynchronously loads the component for MdViewer
 *
 */

import { lazyLoad } from 'utils/loadable';

export const MdViewer = lazyLoad(
  () => import('./index'),
  module => module.MdViewer,
);
