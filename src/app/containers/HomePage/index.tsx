import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom';
import getStorage from 'utils/getStorage';

export function HomePage() {
  const [username, setUsername] = useState<string>('');
  const provider = 'github';
  const history = useHistory();
  const timeoutRef = useRef<any>();

  useEffect(() => {
    // get githup id from local storage
    const lastUsername = getStorage(true).getItem(`${provider}/username`);
    if (lastUsername) {
      setUsername(lastUsername);

      if (getStorage().getItem('setting.askForOpenLast') !== 'disable') {
        timeoutRef.current = setTimeout(() => {
          const confirm = window.confirm(`Open viewer for username: ${lastUsername}`);
          if (confirm) {
            openViewer(lastUsername);
          }
        }, 3000);

        getStorage().setItem('setting.askForOpenLast', 'disable');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChangeUsername(e) {
    setUsername(e.target.value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

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
                  onChange={onChangeUsername}
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
