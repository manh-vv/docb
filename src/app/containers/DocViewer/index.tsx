import { AppHeader } from 'app/components/AppHeader';
import { LoadErrorMessage } from 'app/components/LoadErrorMessage';
import { LoadingLines } from 'app/components/Loading';
import { MdViewer } from 'app/components/MdViewer/Loadable';
import { SidebarMenu } from 'app/components/SidebarMenu/Loadable';
import { BookCollection } from 'app/containers/BookCollection';
import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router';
import styled from 'styled-components';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { docViewerSaga } from './saga';
import {
  selectContentError,
  selectContentLoading,
  selectHtmlContent,
  selectMenuError,
  selectMenuItems,
  selectMenuLoading,
  selectNoMarkdown,
} from './selectors';
import { docViewerActions as actions, reducer, sliceKey } from './slice';

interface PathParams {
  provider: string;
  username: string;
  repository?: string;
  base64FilePath?: string;
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
  const menuLoading = useSelector(selectMenuLoading);
  const contentLoading = useSelector(selectContentLoading);
  const menuError = useSelector(selectMenuError);
  const contentError = useSelector(selectContentError);
  const noMarkdown = useSelector(selectNoMarkdown);

  const dispatch = useDispatch();
  const { hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const {
    provider = '',
    username = '',
    repository,
    base64FilePath,
  } = useParams<keyof PathParams>();

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

    // A new chapter starts at its top, or at the heading the link pointed to. The browser
    // cannot do this itself because the content arrives after the navigation.
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function handleSelectMenu(payload) {
    dispatch(actions.handleClickOnMenuItem(payload.menuItem));
  }

  const bookPath = `/viewer/${provider}/${username}`;
  const book = { provider, username, repository: repository as string };
  const libraryLink = <Link to={bookPath}>Back to {username}</Link>;

  function renderMain() {
    if (menuError) {
      return (
        <LoadErrorMessage
          error={menuError}
          title="Repository not found"
          text={`${username} has no public repository named ${repository}.`}
          onRetry={() => dispatch(actions.fetchBigChapter({ ...book, base64FilePath }))}
        >
          {libraryLink}
        </LoadErrorMessage>
      );
    }
    if (noMarkdown) {
      return (
        <LoadErrorMessage
          title="No markdown files"
          text={`${repository} has no .md files to read.`}
        >
          <a href={`https://github.com/${username}/${repository}`} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
          {libraryLink}
        </LoadErrorMessage>
      );
    }
    if (contentLoading || (menuLoading && base64FilePath)) {
      return (
        <Article aria-busy="true">
          <LoadingLines lines={10} label="Loading chapter" />
        </Article>
      );
    }
    if (contentError) {
      return (
        <LoadErrorMessage
          error={contentError}
          title="Chapter not found"
          text={`This file is not in ${repository}. Choose a chapter from the contents.`}
          onRetry={() =>
            dispatch(actions.fetchMdContent({ ...book, base64FilePath: base64FilePath as string }))
          }
        />
      );
    }
    if (htmlContent) {
      return (
        <Article>
          <MdViewer id="id-md-viewer" htmlContent={htmlContent} afterRender={handleAfterRender} />
        </Article>
      );
    }
    return (
      <Empty>
        <EmptyTitle>{repository}</EmptyTitle>
        <p>Choose a chapter from the contents to start reading.</p>
      </Empty>
    );
  }

  return (
    <>
      <Helmet>
        <title>DocViewer</title>
        <meta name="description" content="DocViewer" />
      </Helmet>

      <Shell>
        <AppHeader
          crumbs={[
            <Link to={bookPath}>{username}</Link>,
            repository && <Link to={`${bookPath}/${repository}`}>{repository}</Link>,
            base64FilePath && (
              <Link to={`${bookPath}/${repository}/${base64FilePath}`}>{base64FilePath}</Link>
            ),
          ]}
        />

        {repository ? (
          <Body>
            <Sidebar aria-label="Contents" aria-busy={menuLoading}>
              <SidebarTitle>Contents</SidebarTitle>
              {menuLoading ? (
                <MenuPlaceholder>
                  <LoadingLines lines={6} label="Loading files" />
                </MenuPlaceholder>
              ) : (
                <SidebarMenu menuItems={menuItems} onSelect={handleSelectMenu} />
              )}
            </Sidebar>

            <Main ref={mainRef}>{renderMain()}</Main>
          </Body>
        ) : (
          <LibraryMain>
            <BookCollection {...{ provider, username }} />
          </LibraryMain>
        )}
      </Shell>
    </>
  );
}

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: var(--db-sidebar-width) minmax(0, 1fr);
  flex: 1;
  min-height: 0;
`;

const Sidebar = styled.aside`
  overflow-y: auto;
  padding: 18px 0 32px;
  border-right: 1px solid var(--db-border);
  background: var(--db-surface-muted);
`;

const SidebarTitle = styled.h2`
  margin: 0 20px 8px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--db-text-muted);
`;

const MenuPlaceholder = styled.div`
  padding: 10px 20px;
`;

const Main = styled.main`
  overflow-y: auto;
  scroll-behavior: smooth;
`;

const LibraryMain = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const Article = styled.article`
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 48px 96px;
`;

const Empty = styled.div`
  max-width: 520px;
  margin: 18vh auto 0;
  padding: 0 24px;
  text-align: center;
  color: var(--db-text-muted);
`;

const EmptyTitle = styled.h1`
  margin: 0 0 8px;
  font-family: var(--db-font-reading);
  font-size: 32px;
  font-weight: 600;
  color: var(--db-heading);
`;
