import fetchCache from '../fetchCache';
import { HttpError, toLoadError } from '../loadError';

describe('toLoadError', () => {
  it('classifies GitHub responses and network failures', () => {
    expect(toLoadError(new HttpError(404, 'Not Found'))).toEqual({ kind: 'not-found' });
    expect(toLoadError(new HttpError(403, 'API rate limit exceeded for 1.2.3.4.', 5000))).toEqual({
      kind: 'rate-limited',
      resetAt: 5000,
    });
    expect(toLoadError(new HttpError(403, 'Resource not accessible'))).toEqual({ kind: 'failed' });
    expect(toLoadError(new TypeError('Failed to fetch'))).toEqual({ kind: 'network' });
    expect(toLoadError(new Error('boom'))).toEqual({ kind: 'failed' });
  });
});

describe('fetchCache', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('throws an HttpError with the rate limit reset and does not cache it', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        { message: 'API rate limit exceeded' },
        { status: 403, headers: { 'x-ratelimit-reset': '1700000000' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const error = await fetchCache('https://api.github.com/users/x').catch(e => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(toLoadError(error)).toEqual({ kind: 'rate-limited', resetAt: 1700000000000 });

    await fetchCache('https://api.github.com/users/x').catch(() => undefined);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('caches successful responses for the session', async () => {
    const fetchMock = vi.fn(async () => Response.json({ login: 'x' }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchCache('https://api.github.com/users/x')).toEqual({ login: 'x' });
    expect(await fetchCache('https://api.github.com/users/x')).toEqual({ login: 'x' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
