import { MenuItem } from 'types/MenuItem';
import { LoadError } from 'utils/loadError';

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
  menuLoading: boolean;
  contentLoading: boolean;
  menuError?: LoadError;
  contentError?: LoadError;
  /** the book has loaded and holds no markdown files */
  noMarkdown: boolean;
  /** the book's top-level README, which opens when no chapter is chosen */
  readme?: Readme;
}

export interface Readme {
  /** the book it belongs to, see bookId in saga.ts */
  bookId: string;
  base64FilePath: string;
}

export type ContainerState = DocViewerState;
