import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';

export function HomePage() {
  const [username, setUsername] = useState<string>('');
  const provider = 'github';
  const history = useHistory();

  useEffect(() => {
    // get githup id from local storage
    const username = window.localStorage.getItem(`${provider}/username`);
    if (username) {
      setUsername(username);

      setTimeout(() => {
        const confirm = window.confirm(`Open viewer for username: ${username}`);
        if (confirm) {
          openViewer(username);
        }
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openViewer(username: string) {
    history.push(`/viewer/${provider}/${username}`);
  }

  function handleSubmit(e) {
    e.preventDefault();

    window.localStorage.setItem(`${provider}/username`, username);
    openViewer(username);
  }

  return (
    <>
      <Helmet>
        <title>docb</title>
        <meta name="description" content="Docb book your MD files" />
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
      </Helmet>

      <div className="container">
        <br />

        <div className="row justify-content-center">
          <div className="col-4">
            <form>
              <div className="form-group">
                <label htmlFor="id-input-github-id">Github id</label>
                <input
                  type="text"
                  className="form-control"
                  id="id-input-github-id"
                  aria-describedby="github-id-help"
                  onChange={v => setUsername(v.target.value)}
                  value={username}
                />
                <small id="github-id-help" className="form-text text-muted">
                  Click on your github profile and get your github id
                </small>
              </div>
              {username && (
                <button onClick={handleSubmit} className="btn btn-outline-primary">
                  View public repositories of <strong>{username}</strong>
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * https://github.com/necolas/css3-social-signin-buttons/blob/gh-pages/auth-buttons.css
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SignIn = styled(({ id, serviceName, className, href }) => (
  <a className={`${className} btn-auth btn-${id} large`} href={href}>
    Sign in with <b>{serviceName}</b>
  </a>
))``;
