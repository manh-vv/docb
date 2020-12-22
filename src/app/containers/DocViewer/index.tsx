import { MdViewer } from 'app/components/MdViewer/Loadable';
import { SidebarMenu } from 'app/components/SidebarMenu/Loadable';
import { BookCollection } from 'app/containers/BookCollection';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { docViewerSaga } from './saga';
import { selectDocViewer } from './selectors';
import { reducer, sliceKey } from './slice';

interface PathParams {
  provider: string;
  username: string;
  repository: string;
  base64FilePath: string;
}

export function DocViewer() {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: docViewerSaga });

  const { htmlContent, menuItems = [] } = useSelector(selectDocViewer);
  const dispatch = useDispatch();

  const { provider, username, repository, base64FilePath } = useParams<PathParams>();

  useEffect(() => {
    if (repository) {
      dispatch({
        type: 'OPEN_BOOK',
        payload: { provider, username, repository, base64FilePath },
      });
    } else {
      dispatch({
        type: 'CLOSE_BOOK',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, username, repository, base64FilePath]);

  function handleAfterRender() {
    dispatch({
      type: 'BUILD_MENU_FROM_MD_CONTENT',
    });
  }

  function handleSelectMenu(payload) {
    dispatch({
      type: 'HANDLE_SELECT_MENU_ITEM',
      payload,
    });
  }

  return (
    <>
      <Helmet>
        <title>DocViewer</title>
        <meta name="description" content="DocViewer" />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700"
          rel="stylesheet"
        ></link>
      </Helmet>

      <Container1>
        <Header>
          <section>
            <Link to={`/`}>Home</Link>
            {' / '}
            {provider} / <Link to={`/viewer/${provider}/${username}`}>{username}</Link>
            {' / '}
            {repository && (
              <>
                <Link to={`/viewer/${provider}/${username}/${repository}`}>{repository}</Link>
                {' / '}
              </>
            )}
            {base64FilePath && (
              <Link to={`/viewer/${provider}/${username}/${repository}/${base64FilePath}`}>
                {base64FilePath}
              </Link>
            )}
          </section>
        </Header>

        <Container2>
          <Menu>
            <SidebarMenu menuItems={menuItems} onSelect={handleSelectMenu} />
          </Menu>

          <Container3>
            <Content>
              {repository ? (
                htmlContent ? (
                  <MdViewer htmlContent={htmlContent} afterRender={handleAfterRender} />
                ) : (
                  <p>{repository}</p>
                )
              ) : (
                <BookCollection {...{ provider, username }} />
              )}
            </Content>
            <Footer></Footer>
          </Container3>
        </Container2>
      </Container1>
    </>
  );
}

const Container1 = styled.div``;

const Header = styled.header`
  position: sticky;
  top: 0;
  height: 60px;
  border-bottom: 1px solid #ddd;
`;

const Container2 = styled.div`
  position: fixed;
  top: 60px;
  height: calc(100vh - 60px);
  width: 100%;
  display: flex;
`;

const Menu = styled.div`
  flex-basis: 20%;
  border-right: 1px solid #ddd;
  overflow: auto;
`;

const Container3 = styled.div`
  flex-basis: 80%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const Content = styled.div`
  flex: 1 0 auto;
  overflow: auto;
`;

const Footer = styled.div`
  flex: 0 0 50px;
  border-top: 1px solid #ddd;
`;
