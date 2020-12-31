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
import { selectHtmlContent, selectMenuItems } from './selectors';
import { docViewerActions as actions, reducer, sliceKey } from './slice';

interface PathParams {
  provider: string;
  username: string;
  repository: string;
  base64FilePath: string;
}
/**
 * Flow of loading:
 * 1. Read params from URL
 * - provider: github [gitlab]
 * - username: organization or user
 * - repository: repository name
 * - base64FilePath: encodeURIComponent(btoa(filePath))
 * 2. If the repository exists
 * - Open a book
 * - - updated selected book
 * - - if the big-chapters (MD files) were not fetched then fetch big-chapters
 * - - - build & update menu items after fetching big-chapters
 * - - if base64FilePath exists then load MD content
 * - - - update content view with HTML content
 * - - else base64FilePath does not exist
 * - - - clear md content
 * 3. Else the repository is empty
 * - Close the book
 * 4. Handle event when a book is rendered
 * 5. Hanlde event when a menu is picked
 */
export function DocViewer() {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: docViewerSaga });

  const menuItems = useSelector(selectMenuItems);
  const htmlContent = useSelector(selectHtmlContent);

  const dispatch = useDispatch();

  const { provider, username, repository, base64FilePath } = useParams<PathParams>();

  useEffect(() => {
    if (repository) {
      dispatch(actions.openBook({ provider, username, repository, base64FilePath }));
    } else {
      dispatch(actions.closeBook());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, username, repository, base64FilePath]);

  function handleAfterRender() {
    dispatch(actions.buildMenuItemsFromHtml());
  }

  function handleSelectMenu(payload) {
    dispatch(actions.handleClickOnMenuItem(payload.menuItem));
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
                  <MdViewer
                    id="id-md-viewer"
                    htmlContent={htmlContent}
                    afterRender={handleAfterRender}
                  />
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
