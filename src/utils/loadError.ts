/** A non-2xx response from the GitHub API */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    /** when the rate limit window resets, epoch milliseconds */
    public resetAt?: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static async from(res: Response): Promise<HttpError> {
    let message = res.statusText;
    try {
      message = (await res.json()).message || message;
    } catch {
      // not a JSON body
    }
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    return new HttpError(res.status, message, reset ? reset * 1000 : undefined);
  }
}

export type LoadErrorKind = 'not-found' | 'rate-limited' | 'network' | 'failed';

/** Why something could not load, in a form the store can keep */
export interface LoadError {
  kind: LoadErrorKind;
  resetAt?: number;
}

export function toLoadError(error: unknown): LoadError {
  if (error instanceof HttpError) {
    if (error.status === 404) {
      return { kind: 'not-found' };
    }
    if ((error.status === 403 || error.status === 429) && /rate limit/i.test(error.message)) {
      return { kind: 'rate-limited', resetAt: error.resetAt };
    }
    return { kind: 'failed' };
  }
  // fetch rejects with a TypeError when the request never got a response
  if (error instanceof TypeError) {
    return { kind: 'network' };
  }
  return { kind: 'failed' };
}
