import { LoadError } from 'utils/loadError';

/* --- STATE --- */
export interface BookCollectionState {
  perPage: number;
  curPage: number;
  totalPage: number;
  hasNext: boolean;
  hasBack: boolean;
  total: number;
  items: any[];
  loading: boolean;
  error?: LoadError;
}

export type ContainerState = BookCollectionState;

export interface FetchBookSuccess {
  curPage: number;
  perPage: number;
  items: any[];
  /** repositories of the account the viewer can list, when known */
  repoCount?: number;
}

export interface FetchBookPayload {
  provider: string;
  username: string;
  perPage?: number;
  nextPage: number;
}
