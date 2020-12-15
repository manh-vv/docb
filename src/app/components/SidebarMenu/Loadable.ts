/**
 *
 * Asynchronously loads the component for SidebarMenu
 *
 */

import { lazyLoad } from 'utils/loadable';

export const SidebarMenu = lazyLoad(
  () => import('./index'),
  module => module.SidebarMenu,
);
