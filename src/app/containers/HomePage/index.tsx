import { faFish } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'app/components/Card';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import getStorage from 'utils/getStorage';
import keepTextLength from 'utils/keepTextLength';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { homePageSaga } from './saga';
import { selectGithubUsers } from './selectors';
import { reducer, sliceKey } from './slice';

export function HomePage() {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: homePageSaga });

  const githubUsers = useSelector(selectGithubUsers);
  const dispatch = useDispatch();

  const [username, setUsername] = useState<string>('');
  const provider = 'github';
  const history = useHistory();
  const timeoutRef = useRef<any>();

  useEffect(() => {
    // get githup id from local storage
    const lastUsername = getStorage(true).getItem(`${provider}/username`);
    if (lastUsername) {
      setUsername(lastUsername);
    }

    dispatch({
      type: 'INIT_HOME_PAGE',
    });
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
          <div className="col-md-8 col-sm-10 col-xs-12">
            <form className="row row-cols-lg-auto g-3 align-items-center">
              <div className="col-12">
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
                <div className="col-12">
                  <button onClick={handleSubmit} className="btn btn-primary">
                    <FontAwesomeIcon icon={faFish} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <br />

        <div className="row">
          {githubUsers.map(u => (
            <div className="col-md-3 col-sm-12">
              <Card
                key={u.id}
                name={u.name}
                desc={keepTextLength(u.bio, '...') || ' '}
                img={u.avatar_url}
                href={`/viewer/${provider}/${u.login}`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
