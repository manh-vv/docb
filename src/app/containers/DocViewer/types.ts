import { MenuItem } from 'types/MenuItem';

export interface ShowChildItems {
  menuItem: MenuItem;
  menuItems: MenuItem[];
}
export interface HideChildItems {
  menuItem: MenuItem;
}

export interface FetchBigChapter {
  provider: string;
  username: string;
  repository: string;
  base64FilePath?: string;
}
export interface FetchMdContent {
  provider: string;
  username: string;
  repository: string;
  base64FilePath: string;
}
export interface SelectedBook {
  provider: string;
  username: string;
  repository?: string;
  base64FilePath?: string;
}
export interface DocViewerState {
  htmlContent: string;
  menuItems: MenuItem[];
  selectedBook?: SelectedBook;
  lastActiveMenuItem?: MenuItem;
}

export type ContainerState = DocViewerState;
