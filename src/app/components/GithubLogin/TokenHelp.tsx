/**
 *
 * TokenHelp
 *
 * Why an organization's private repositories can be missing, and which token reads them.
 * A short guide line, with the details folded away until the user asks for them.
 *
 */
import { faArrowUpRightFromSquare, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo, ReactNode } from 'react';
import styled from 'styled-components';

const CLASSIC_TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo&description=docb';

interface Props {
  /** the short line shown above the folded details */
  children: ReactNode;
}

export const TokenHelp = memo(({ children }: Props) => (
  <Help>
    <Guide>{children}</Guide>
    <details>
      <summary>
        <Chevron icon={faChevronRight} />
        Organizations and token types
      </summary>
      <Body>
        <p>
          <b>Fine-grained token.</b> It reads one account only, the one chosen as its{' '}
          <b>Resource owner</b>. That is your own account unless you change it, so an
          organization&apos;s private repositories stay hidden. To read them, pick the organization
          as the resource owner, choose all repositories (or the ones you want) and give{' '}
          <b>Contents</b> read-only access. Some organizations approve tokens first: an owner does
          that in the organization settings under <b>Personal access tokens</b>.
        </p>
        <p>
          <b>Classic token.</b> It reads your account and every organization you belong to.{' '}
          <a href={CLASSIC_TOKEN_URL} target="_blank" rel="noreferrer">
            Create one with the <code>repo</code> scope{' '}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
          </a>
          . That scope also allows writing, which docb never does. If an organization uses SAML
          single sign-on, authorize the token for it with <b>Configure SSO</b>.
        </p>
        <p>
          docb keeps one token at a time, so to read private repositories from your own account and
          an organization together, use a classic token.
        </p>
      </Body>
    </details>
  </Help>
));

const Help = styled.div`
  margin: 14px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius);
  font-size: 13px;
  color: var(--db-text-muted);
  background: var(--db-surface-muted);

  summary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-weight: 600;
    color: var(--db-accent);
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      color: var(--db-accent-hover);
    }
  }

  details[open] > summary > svg {
    transform: rotate(90deg);
  }
`;

const Guide = styled.p`
  margin: 0;
`;

const Chevron = styled(FontAwesomeIcon)`
  font-size: 10px;
  transition: transform 0.15s var(--db-ease);
`;

const Body = styled.div`
  margin-top: 8px;

  p {
    margin: 0;
  }

  p + p {
    margin-top: 8px;
  }

  b {
    color: var(--db-text);
  }

  code {
    font-size: 12px;
    color: inherit;
  }
`;
