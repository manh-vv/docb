/**
 *
 * LoadErrorMessage
 *
 * Explains why something did not load, or that there is nothing to show, with a way forward
 *
 */
import {
  faBookOpen,
  faClock,
  faMagnifyingGlass,
  faRotateRight,
  faTriangleExclamation,
  faWifi,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo, ReactNode } from 'react';
import styled from 'styled-components';
import { LoadError } from 'utils/loadError';

interface Props {
  error?: LoadError;
  /** what to say when the thing does not exist, or when there is simply nothing to show */
  title: string;
  text: ReactNode;
  onRetry?: () => void;
  /** extra actions, e.g. a link back */
  children?: ReactNode;
}

function describe(error: LoadError): { icon: IconDefinition; title: string; text: string } {
  switch (error.kind) {
    case 'rate-limited': {
      const at = error.resetAt
        ? ` after ${new Date(error.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : ' in a little while';
      return {
        icon: faClock,
        title: 'GitHub request limit reached',
        text: `Visitors without a GitHub login can make 60 requests per hour. Try again${at}.`,
      };
    }
    case 'network':
      return {
        icon: faWifi,
        title: 'Cannot reach GitHub',
        text: 'Check your connection, then try again.',
      };
    default:
      return {
        icon: faTriangleExclamation,
        title: 'Something went wrong',
        text: 'GitHub returned an unexpected response. Try again in a moment.',
      };
  }
}

export const LoadErrorMessage = memo(({ error, title, text, onRetry, children }: Props) => {
  const missing = !error || error.kind === 'not-found';
  const content = missing
    ? { icon: error ? faMagnifyingGlass : faBookOpen, title, text }
    : describe(error);

  return (
    <Wrapper role={missing ? 'status' : 'alert'}>
      <Icon>
        <FontAwesomeIcon icon={content.icon} />
      </Icon>
      <Title>{content.title}</Title>
      <Text>{content.text}</Text>
      <Actions>
        {!missing && onRetry && (
          <Retry type="button" onClick={onRetry}>
            <FontAwesomeIcon icon={faRotateRight} /> Try again
          </Retry>
        )}
        {children}
      </Actions>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  max-width: 460px;
  margin: 12vh auto 0;
  padding: 0 24px;
  text-align: center;
`;

const Icon = styled.div`
  display: inline-grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  border-radius: 16px;
  font-size: 20px;
  color: var(--db-accent);
  background: var(--db-accent-soft);
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-family: var(--db-font-reading);
  font-size: 26px;
  font-weight: var(--db-weight-display);
  letter-spacing: -0.01em;
  color: var(--db-heading);
`;

const Text = styled.p`
  margin: 0 0 22px;
  color: var(--db-text-muted);
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border: 1px solid var(--db-border-strong);
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--db-text);
    text-decoration: none;
    background: var(--db-surface);
  }

  a:hover {
    color: var(--db-heading);
    border-color: var(--db-text-muted);
  }
`;

const Retry = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--db-on-accent);
  background: var(--db-accent);

  &:hover {
    background: var(--db-accent-hover);
  }
`;
