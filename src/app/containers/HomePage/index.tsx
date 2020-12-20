import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import getStorage from 'utils/getStorage';

export function HomePage() {
  const [username, setUsername] = useState<string>('');
  const provider = 'github';
  const history = useHistory();

  useEffect(() => {
    // get githup id from local storage
    const lastUsername = getStorage(true).getItem(`${provider}/username`);
    if (lastUsername) {
      setUsername(lastUsername);

      if (getStorage().getItem('setting.askForOpenLast') !== 'disable') {
        const confirm = window.confirm(`Open viewer for username: ${lastUsername}`);
        if (confirm) {
          openViewer(lastUsername);
        }

        getStorage().setItem('setting.askForOpenLast', 'disable');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openViewer(username: string) {
    history.push(`/viewer/${provider}/${username}`);
  }

  function handleSubmit(e) {
    e.preventDefault();

    getStorage(true).setItem(`${provider}/username`, username);
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
