/* --- STATE --- */
export interface BookCollectionState {
  perPage: number;
  curPage: number;
  totalPage: number;
  hasNext: boolean;
  hasBack: boolean;
  total: number;
  items: any[];
}

export type ContainerState = BookCollectionState;

export interface FetchBookPayload {
  provider: string;
  username: string;
  perPage?: number;
  nextPage: number;
}
