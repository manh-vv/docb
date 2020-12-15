/**
 *
 * Asynchronously loads the component for BookCollectionView
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BookCollectionView = lazyLoad(
  () => import('./index'),
  module => module.BookCollectionView,
);
