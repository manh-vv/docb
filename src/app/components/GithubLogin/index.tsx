/**
 *
 * GithubLogin
 *
 * Sign in with a personal access token: private repositories, and GitHub's
 * 5,000 requests per hour instead of 60. The token never leaves the browser except to GitHub.
 *
 */
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faArrowUpRightFromSquare, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FormEvent, memo, useState } from 'react';
import styled from 'styled-components';
import { compact } from 'styles/media';
import { signIn, signOut, useGithubAuth } from 'utils/githubAuth';
import { HttpError } from 'utils/loadError';

import { Modal } from '../Modal';

const NEW_TOKEN_URL =
  'https://github.com/settings/personal-access-tokens/new?name=docb&description=Read%20markdown%20in%20docb&contents=read';

function describeError(error: unknown): string {
  if (error instanceof HttpError && error.status === 401) {
    return 'GitHub did not accept this token. Check that it was copied in full and has not expired.';
  }
  if (error instanceof TypeError) {
    return 'Cannot reach GitHub. Check your connection, then try again.';
  }
  return 'GitHub returned an unexpected response. Try again in a moment.';
}

export const GithubLogin = memo(() => {
  const auth = useGithubAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  function close() {
    setOpen(false);
    setToken('');
    setError(undefined);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = token.trim();
    if (!value) {
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await signIn(value);
      // load everything again with the token
      window.location.reload();
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    window.location.reload();
  }

  return (
    <>
      <Trigger
        type="button"
        aria-label={auth ? `Signed in as ${auth.login}` : 'Sign in with GitHub'}
        title={auth ? `Signed in as ${auth.login}` : 'Sign in with GitHub'}
        $signedIn={!!auth}
        onClick={() => setOpen(true)}
      >
        {auth ? (
          <Avatar src={auth.avatarUrl} alt="" />
        ) : (
          <>
            <FontAwesomeIcon icon={faGithub} />
            <TriggerText>Sign in</TriggerText>
          </>
        )}
      </Trigger>

      <Modal
        open={open}
        onClose={close}
        title={auth ? `Signed in as ${auth.login}` : 'Sign in with GitHub'}
        icon={auth ? <BigAvatar src={auth.avatarUrl} alt="" /> : <BigMark icon={faGithub} />}
      >
        {auth ? (
          <>
            <Lead>
              docb reads GitHub with your token, so your private repositories open here and the
              request limit is 5,000 per hour.
            </Lead>
            <Primary type="button" onClick={handleSignOut} disabled={busy}>
              Sign out
            </Primary>
            <Note>Signing out removes the token and the pages cached with it.</Note>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Lead>
              Without signing in, GitHub allows 60 requests per hour and only public repositories.
            </Lead>
            <Steps>
              <li>
                <a href={NEW_TOKEN_URL} target="_blank" rel="noreferrer">
                  Create a fine-grained token{' '}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
                </a>{' '}
                with read-only <b>Contents</b> access to the repositories you want to read.
              </li>
              <li>Paste it below.</li>
            </Steps>
            <label className="visually-hidden" htmlFor="github-token">
              Personal access token
            </label>
            <input
              id="github-token"
              className="form-control"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="github_pat_..."
              value={token}
              onChange={e => setToken(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'github-token-error' : undefined}
              autoFocus
            />
            {error && (
              <ErrorText id="github-token-error" role="alert">
                {error}
              </ErrorText>
            )}
            <Primary type="submit" disabled={busy || !token.trim()}>
              {busy ? 'Checking...' : 'Sign in'}
            </Primary>
            <Note>
              <FontAwesomeIcon icon={faLock} /> The token stays in this browser and is only sent to
              api.github.com.
            </Note>
          </form>
        )}
      </Modal>
    </>
  );
});

const Trigger = styled.button<{ $signedIn: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 34px;
  min-width: 34px;
  padding: ${p => (p.$signedIn ? '0' : '0 11px')};
  border: 1px solid var(--db-border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--db-text-muted);
  background: var(--db-surface-muted);
  overflow: hidden;
  transition: color 0.15s var(--db-ease);

  &:hover {
    color: var(--db-heading);
  }

  @media ${compact} {
    padding: 0;
  }
`;

const TriggerText = styled.span`
  @media ${compact} {
    display: none;
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
`;

const BigAvatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: var(--db-shadow-sm);
`;

const BigMark = styled(FontAwesomeIcon)`
  font-size: 44px;
  color: var(--db-heading);
`;

const Lead = styled.p`
  margin: 0 0 16px;
  text-align: center;
  color: var(--db-text-muted);
`;

const Steps = styled.ol`
  margin: 0 0 14px;
  padding-left: 20px;
  font-size: 14px;

  li + li {
    margin-top: 4px;
  }
`;

const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 13.5px;
  color: var(--db-heading);
`;

const Primary = styled.button`
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 10px 16px;
  border: 0;
  border-radius: var(--db-radius);
  font-size: 14px;
  font-weight: 600;
  color: var(--db-on-accent);
  background: var(--db-accent);

  &:hover:not(:disabled) {
    background: var(--db-accent-hover);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const Note = styled.p`
  margin: 12px 0 0;
  font-size: 12.5px;
  text-align: center;
  color: var(--db-text-muted);
`;
