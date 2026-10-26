import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppHeader } from 'app/components/AppHeader';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import styled from 'styled-components';
import pageTitle from 'utils/pageTitle';

import { P } from './P';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>{pageTitle('404 Page Not Found')}</title>
        <meta name="description" content="Page not found" />
      </Helmet>
      <AppHeader />
      <Wrapper>
        <Code>404</Code>
        <Title>This page is not in the library</Title>
        <P>Page not found.</P>
        <HomeLink to="/">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to home
        </HomeLink>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--db-header-height));
  padding: 24px;
  text-align: center;
`;

const Code = styled.div`
  font-family: var(--db-font-reading);
  font-size: 96px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--db-accent);
`;

const Title = styled.h1`
  margin: 18px 0 6px;
  font-family: var(--db-font-reading);
  font-size: 28px;
  font-weight: 600;
  color: var(--db-heading);
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  color: var(--db-on-accent);
  text-decoration: none;
  background: var(--db-accent);

  &:hover {
    color: var(--db-on-accent);
    background: var(--db-accent-hover);
  }
`;
