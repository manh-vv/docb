import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppHeader } from 'app/components/AppHeader';
import { Card } from 'app/components/Card';
import { LoadingBox, LoadingLines } from 'app/components/Loading';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { compact } from 'styles/media';
import getStorage from 'utils/getStorage';
import { useGithubAuth } from 'utils/githubAuth';
import pageTitle from 'utils/pageTitle';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';

import { homePageSaga } from './saga';
import {
  selectGithubUsers,
  selectLoading,
  selectMyAccounts,
  selectMyAccountsLoading,
} from './selectors';
import { homePageActions, reducer, sliceKey } from './slice';

export function HomePage() {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: homePageSaga });

  const githubUsers = useSelector(selectGithubUsers);
  const loading = useSelector(selectLoading);
  const myAccounts = useSelector(selectMyAccounts);
  const myAccountsLoading = useSelector(selectMyAccountsLoading);
  const auth = useGithubAuth();
  const dispatch = useDispatch();

  const provider = 'github';
  // get githup id from local storage
  const [username, setUsername] = useState<string>(
    () => getStorage(true).getItem(`${provider}/username`) || '',
  );
  const navigate = useNavigate();
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    dispatch(homePageActions.initHomePage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // signing in or out in another tab does not reload this one
  useEffect(() => {
    dispatch(homePageActions.fetchMyAccounts());
  }, [dispatch, auth?.login]);

  function onChangeUsername(e) {
    setUsername(e.target.value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function openViewer(username: string) {
    navigate(`/viewer/${provider}/${username}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) {
      return;
    }

    getStorage(true).setItem(`${provider}/username`, name);
    openViewer(name);
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle('Read GitHub repositories like books')}</title>
        <meta
          name="description"
          content="Browse a GitHub user's repositories and read their markdown as a book"
        />
      </Helmet>

      <AppHeader />

      <Page>
        <Hero>
          <Eyebrow>Markdown reader for GitHub</Eyebrow>
          <Title>Read any repository like a book</Title>
          <Lead>
            Enter a GitHub user or organization to browse their repositories and read the markdown
            inside, with a table of contents built from every heading.
          </Lead>

          <Search onSubmit={handleSubmit}>
            <label htmlFor="id-input-github-id" className="visually-hidden">
              GitHub user or organization
            </label>
            <Prefix aria-hidden="true">github.com/</Prefix>
            <SearchInput
              type="text"
              id="id-input-github-id"
              aria-describedby="github-id-help"
              placeholder="username"
              autoComplete="off"
              spellCheck={false}
              onChange={onChangeUsername}
              value={username}
            />
            <SearchButton type="submit" disabled={!username.trim()}>
              Open library <FontAwesomeIcon icon={faArrowRight} />
            </SearchButton>
          </Search>
          <Hint id="github-id-help">The name in a GitHub profile URL, for example facebook.</Hint>
        </Hero>

        {auth && (
          <Section aria-labelledby="mine-title">
            <SectionTitle id="mine-title">Your libraries</SectionTitle>
            <AccountGrid
              accounts={myAccounts}
              loading={myAccountsLoading}
              placeholders={2}
              label="Loading your accounts"
            />
          </Section>
        )}

        <Section aria-labelledby="featured-title">
          <SectionTitle id="featured-title">Featured libraries</SectionTitle>
          <AccountGrid
            accounts={githubUsers}
            loading={loading}
            placeholders={4}
            label="Loading featured accounts"
          />
        </Section>
      </Page>
    </>
  );
}

interface AccountGridProps {
  /** GitHub users or organizations */
  accounts: any[];
  loading: boolean;
  placeholders: number;
  label: string;
}

function AccountGrid({ accounts, loading, placeholders, label }: AccountGridProps) {
  return (
    <Grid aria-busy={loading}>
      {loading &&
        Array.from({ length: placeholders }, (_, i) => (
          <PlaceholderCard key={i}>
            <LoadingBox style={{ width: 52, height: 52 }} />
            <LoadingLines lines={3} label={label} />
          </PlaceholderCard>
        ))}
      {accounts.map(u => (
        <Card
          key={u.id}
          name={u.name || u.login}
          // organizations have a description instead of a bio
          desc={u.bio || u.description || `@${u.login}`}
          img={u.avatar_url}
          href={`/viewer/github/${u.login}`}
        />
      ))}
    </Grid>
  );
}

const Page = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px 80px;

  @media ${compact} {
    padding: 0 16px 56px;
  }
`;

const Hero = styled.section`
  max-width: 720px;
  margin: 0 auto;
  padding: 88px 0 72px;
  text-align: center;

  @media ${compact} {
    padding: 48px 0 44px;
  }
`;

const Eyebrow = styled.p`
  display: inline-block;
  margin: 0 0 18px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--db-accent);
  background: var(--db-accent-soft);
`;

const Title = styled.h1`
  margin: 0 0 16px;
  font-family: var(--db-font-reading);
  font-size: clamp(34px, 6vw, 54px);
  font-weight: var(--db-weight-display);
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: var(--db-heading);
`;

const Lead = styled.p`
  max-width: 580px;
  margin: 0 auto 36px;
  font-size: 17px;
  color: var(--db-text-muted);

  @media ${compact} {
    font-size: 15.5px;
  }
`;

const Search = styled.form`
  display: flex;
  align-items: center;
  max-width: 560px;
  margin: 0 auto;
  padding: 6px;
  border: 1px solid var(--db-border-strong);
  border-radius: 14px;
  background: var(--db-surface);
  box-shadow: var(--db-shadow-lg);
  transition:
    border-color 0.15s var(--db-ease),
    box-shadow 0.15s var(--db-ease);

  &:focus-within {
    border-color: var(--db-accent);
    box-shadow:
      0 0 0 4px var(--db-accent-soft),
      var(--db-shadow-lg);
  }
`;

const Prefix = styled.span`
  @media ${compact} {
    display: none;
  }

  padding-left: 12px;
  font-family: var(--db-font-mono);
  font-size: 14px;
  color: var(--db-text-muted);
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 10px 6px 10px 2px;

  @media ${compact} {
    padding-left: 10px;
  }

  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--db-font-mono);
  font-size: 14px;
  color: var(--db-heading);

  &::placeholder {
    color: var(--db-text-muted);
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 0;
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--db-on-accent);
  background: var(--db-accent);
  transition:
    background 0.15s var(--db-ease),
    opacity 0.15s var(--db-ease);

  &:hover:not(:disabled) {
    background: var(--db-accent-hover);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Hint = styled.p`
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--db-text-muted);
`;

const Section = styled.section`
  & + & {
    margin-top: 48px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 18px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--db-text-muted);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
`;

const PlaceholderCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius-lg);
  background: var(--db-surface);
`;
