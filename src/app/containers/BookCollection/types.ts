/* --- STATE --- */
export interface BookCollectionState {
  perPage: number;
  curPage: number;
  hasNext: boolean;
  hasBack: boolean;
  total: number;
  items: any[];
}

export type ContainerState = BookCollectionState;
