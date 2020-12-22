/* --- STATE --- */
export interface DocViewerState {
  content: string;
  htmlContent: string;
  menuItems: any[];
  selectedBook: {
    provider: string;
    username: string;
    repository?: string;
    base64FilePath?: string;
  } | null;
  lastActiveMenuItem: {
    menuItem: string;
    index: number;
  } | null;
}

export type ContainerState = DocViewerState;
