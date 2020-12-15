/**
 *
 * Asynchronously loads the component for BookCollection
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BookCollection = lazyLoad(
  () => import('./index'),
  module => module.BookCollection,
);
