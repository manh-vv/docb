/* --- STATE --- */
export interface HomePageState {
  githubUsers: any[];
  loading: boolean;
  /** the signed in user's own account and organizations, empty when signed out */
  myAccounts: any[];
  myAccountsLoading: boolean;
}

export type ContainerState = HomePageState;
