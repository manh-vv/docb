import { runSaga } from 'redux-saga';
import githubApi from 'utils/githubApi';
import { readGithubAuth } from 'utils/githubAuth';

import { fetchMyAccounts } from '../saga';
import { homePageActions as actions } from '../slice';

vi.mock('utils/githubApi', () => ({ default: vi.fn() }));
vi.mock('utils/githubAuth', () => ({ readGithubAuth: vi.fn() }));

const auth = { token: 't', login: 'me', avatarUrl: 'https://avatars/me' };

async function run() {
  const dispatched: any[] = [];
  await runSaga({ dispatch: action => dispatched.push(action) }, fetchMyAccounts).toPromise();
  return dispatched;
}

describe('fetchMyAccounts', () => {
  beforeEach(() => {
    vi.mocked(githubApi).mockReset();
  });

  it('lists nothing when signed out', async () => {
    vi.mocked(readGithubAuth).mockReturnValue(null);
    expect(await run()).toEqual([actions.myAccounts([])]);
    expect(githubApi).not.toHaveBeenCalled();
  });

  it('lists the user first, then their organizations', async () => {
    vi.mocked(readGithubAuth).mockReturnValue(auth);
    vi.mocked(githubApi).mockImplementation(async path =>
      path === '/user' ? { id: 1, login: 'me' } : [{ id: 2, login: 'acme' }],
    );
    expect(await run()).toEqual([
      actions.myAccounts([
        { id: 1, login: 'me' },
        { id: 2, login: 'acme' },
      ]),
    ]);
  });

  it('falls back to the stored sign in when GitHub fails', async () => {
    vi.mocked(readGithubAuth).mockReturnValue(auth);
    vi.mocked(githubApi).mockRejectedValue(new TypeError('offline'));
    expect(await run()).toEqual([
      actions.myAccounts([{ id: 'me', login: 'me', avatar_url: 'https://avatars/me' }]),
    ]);
  });
});
