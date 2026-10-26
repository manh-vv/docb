import { AppHeader } from 'app/components/AppHeader';
import { LoadErrorMessage } from 'app/components/LoadErrorMessage';
import { LoadingLines } from 'app/components/Loading';
import { MdViewer } from 'app/components/MdViewer/Loadable';
import { SidebarMenu } from 'app/components/SidebarMenu/Loadable';
import { BranchPicker } from 'app/components/BranchPicker';
import { BookCollection } from 'app/containers/BookCollection';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faListUl } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import styled from 'styled-components';
import { compact, narrow } from 'styles/media';
import { githubUrl, withRef } from 'utils/bookUrls';
import pageTitle from 'utils/pageTitle';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { bookId, decodeFilePath, docViewerSaga } from './saga';
import {
  selectContentError,
  selectContentLoading,
  selectHtmlContent,
  selectMenuError,
  selectMenuItems,
  selectMenuLoading,
  selectNoMarkdown,
  selectReadme,
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
 * - base64FilePath: encodeURIComponent(base64 of the UTF-8 file path), see utils/base64
 * - ref (query): the branch, when it is not the default one, see utils/bookUrls
 * 2. If the repository exists
 * - Open a book
 * - - updated selected book
 * - - if the big-chapters (MD files) were not fetched then fetch big-chapters
 * - - - build & update menu items after fetching big-chapters
 * - - if base64FilePath exists then load MD content
 * - - - update content view with HTML content
 * - - else base64FilePath does not exist
 * - - - open the book's top-level README if it has one (the URL is replaced with its chapter)
 * - - - else clear md content
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
  const readme = useSelector(selectReadme);

  const dispatch = useDispatch();
  const { hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  // the contents drawer on narrow screens
  const [contentsOpen, setContentsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!contentsOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContentsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [contentsOpen]);

  const {
    provider = '',
    username = '',
    repository,
    base64FilePath,
  } = useParams<keyof PathParams>();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || undefined;
  const navigate = useNavigate();

  useEffect(() => {
    if (repository) {
      dispatch(actions.openBook({ provider, username, repository, ref, base64FilePath }));
    } else {
      dispatch(actions.closeBook());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, username, repository, ref, base64FilePath]);

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
    // picking a chapter or heading closes the drawer; folders just expand
    if (payload.menuItem.type !== 'branch') {
      setContentsOpen(false);
    }
  }

  const bookPath = `/viewer/${provider}/${username}`;
  const filePath = decodeFilePath(base64FilePath);
  const title = [filePath, repository ? `${username}/${repository}` : username]
    .filter(Boolean)
    .join(' | ');
  const book = { provider, username, repository: repository as string, ref };
  const bookRoute = withRef(`${bookPath}/${repository}`, ref);
  const chapterRoute = (segment: string) => withRef(`${bookPath}/${repository}/${segment}`, ref);
  const libraryLink = <Link to={bookPath}>Back to {username}</Link>;

  /** Read the open chapter on another branch; a file missing there shows "Chapter not found" */
  function switchBranch(branch?: string) {
    const chapter = base64FilePath ? `/${base64FilePath}` : '';
    navigate(withRef(`${bookPath}/${repository}${chapter}`, branch));
  }

  function renderMain() {
    if (menuError) {
      return (
        <LoadErrorMessage
          error={menuError}
          title={ref ? 'Branch not found' : 'Repository not found'}
          text={
            ref
              ? `${username}/${repository} has no branch named ${ref}.`
              : `${username} has no public repository named ${repository}.`
          }
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
          <a href={githubUrl(`${username}/${repository}`, ref)} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
          {libraryLink}
        </LoadErrorMessage>
      );
    }
    // the README is scoped by book, so one left from the previous book is never followed
    if (!base64FilePath && readme && readme.bookId === bookId(book)) {
      return <Navigate replace to={chapterRoute(readme.base64FilePath)} />;
    }
    if (contentLoading || menuLoading) {
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
          text={`This file is not in ${repository}${ref ? ` on ${ref}` : ''}. Choose a chapter from the contents.`}
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
        <title>{pageTitle(title)}</title>
        <meta
          name="description"
          content={
            repository
              ? `Read the markdown in ${username}/${repository}`
              : `Repositories of ${username}`
          }
        />
      </Helmet>

      <Shell>
        <AppHeader
          crumbs={[
            <Link to={bookPath}>{username}</Link>,
            repository && <Link to={bookRoute}>{repository}</Link>,
            filePath && <Link to={chapterRoute(base64FilePath as string)}>{filePath}</Link>,
          ]}
          actions={
            repository && (
              <>
                <HeaderButton
                  as="a"
                  href={githubUrl(`${username}/${repository}`, ref, filePath)}
                  target="_blank"
                  rel="noreferrer"
                  title={filePath ? 'View this file on GitHub' : 'View the repository on GitHub'}
                >
                  <FontAwesomeIcon icon={faGithub} />
                  <HeaderButtonText>GitHub</HeaderButtonText>
                </HeaderButton>
                <ContentsToggle
                  ref={toggleRef}
                  type="button"
                  aria-label="Contents"
                  aria-controls="docb-contents"
                  aria-expanded={contentsOpen}
                  onClick={() => setContentsOpen(open => !open)}
                >
                  <FontAwesomeIcon icon={faListUl} fixedWidth />
                </ContentsToggle>
              </>
            )
          }
        />

        {repository ? (
          <Body>
            {contentsOpen && <Backdrop onClick={() => setContentsOpen(false)} />}
            <Sidebar
              id="docb-contents"
              aria-label="Contents"
              aria-busy={menuLoading}
              $open={contentsOpen}
            >
              <BranchPicker
                username={username}
                repository={repository}
                branch={ref}
                onChange={switchBranch}
              />
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

  @media ${narrow} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  overflow-y: auto;
  padding: 18px 0 32px;
  border-right: 1px solid var(--db-border);
  background: var(--db-surface-muted);

  @media ${narrow} {
    position: fixed;
    z-index: 30;
    top: var(--db-header-height);
    bottom: 0;
    left: 0;
    width: min(320px, 86vw);
    transform: translateX(${p => (p.$open ? '0' : '-100%')});
    /* hidden when closed, so the links are not tabbable off screen */
    visibility: ${p => (p.$open ? 'visible' : 'hidden')};
    box-shadow: ${p => (p.$open ? 'var(--db-shadow-lg)' : 'none')};
    transition:
      transform 0.25s var(--db-ease),
      visibility 0s linear ${p => (p.$open ? '0s' : '0.25s')};
  }
`;

const Backdrop = styled.div`
  display: none;

  @media ${narrow} {
    position: fixed;
    z-index: 25;
    inset: var(--db-header-height) 0 0 0;
    display: block;
    background: rgb(0 0 0 / 0.35);
    animation: fade-in 0.2s var(--db-ease);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
`;

const ContentsToggle = styled.button`
  display: none;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--db-border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--db-text-muted);
  background: var(--db-surface-muted);

  &[aria-expanded='true'] {
    color: var(--db-accent);
  }

  @media ${narrow} {
    display: inline-grid;
  }
`;

const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 34px;
  min-width: 34px;
  padding: 0 11px;
  border: 1px solid var(--db-border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--db-text-muted);
  background: var(--db-surface-muted);
  text-decoration: none;
  transition: color 0.15s var(--db-ease);

  &:hover {
    color: var(--db-heading);
  }

  @media ${compact} {
    padding: 0;
  }
`;

const HeaderButtonText = styled.span`
  @media ${compact} {
    display: none;
  }
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

  @media ${compact} {
    padding: 28px 18px 72px;
  }
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
  font-weight: var(--db-weight-display);
  color: var(--db-heading);
`;
