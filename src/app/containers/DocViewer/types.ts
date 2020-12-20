/* --- STATE --- */
export interface DocViewerState {
  content: string;
  htmlContent: string;
  menuItems: any[];
  selectBook: {
    username: string;
    repository: string;
  } | null;
}

export type ContainerState = DocViewerState;
