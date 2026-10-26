/**
 *
 * AppHeader
 *
 * The sticky bar on every page: brand, an optional breadcrumb, and actions on the right
 *
 */
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Children, Fragment, memo, ReactNode } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { compact, narrow } from 'styles/media';

import { ColorModeSwitch } from '../ColorModeSwitch';
import { GithubLogin } from '../GithubLogin';
import { ThemePicker } from '../ThemePicker';

interface Props {
  /** Breadcrumb entries after the brand, separated with a slash */
  crumbs?: ReactNode[];
  actions?: ReactNode;
}

export const AppHeader = memo(({ crumbs = [], actions }: Props) => {
  const items = Children.toArray(crumbs).filter(Boolean);

  return (
    <Bar>
      <Brand to="/" aria-label="docb home">
        <BrandMark>
          <FontAwesomeIcon icon={faBookOpen} />
        </BrandMark>
        <BrandText>docb</BrandText>
      </Brand>

      {items.length > 0 && (
        <Crumbs aria-label="Breadcrumb">
          {items.map((crumb, i) => (
            <Fragment key={i}>
              <Separator aria-hidden="true">/</Separator>
              <Crumb aria-current={i === items.length - 1 ? 'page' : undefined}>{crumb}</Crumb>
            </Fragment>
          ))}
        </Crumbs>
      )}

      <Actions>
        {actions}
        <GithubLogin />
        <ThemePicker />
        <ColorModeSwitch />
      </Actions>
    </Bar>
  );
});

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  height: var(--db-header-height);
  padding: 0 24px;
  background: var(--db-header-bg);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--db-border);

  @media ${narrow} {
    gap: 10px;
    padding: 0 14px;
  }
`;

const BrandText = styled.span`
  @media ${compact} {
    display: none;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.02em;
  color: var(--db-heading);
  text-decoration: none;

  &:hover {
    color: var(--db-heading);
  }
`;

const BrandMark = styled.span`
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  font-size: 14px;
  color: var(--db-on-accent);
  background: linear-gradient(135deg, var(--db-accent), var(--db-accent-hover));
  box-shadow: var(--db-shadow-sm);
`;

const Crumbs = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 14px;
  color: var(--db-text-muted);

  /* phones: only the current page */
  @media ${compact} {
    & > :nth-last-child(n + 3) {
      display: none;
    }
  }
`;

const Separator = styled.span`
  color: var(--db-border-strong);
`;

const Crumb = styled.span`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a {
    color: var(--db-text-muted);
    text-decoration: none;
    transition: color 0.15s var(--db-ease);
  }

  a:hover {
    color: var(--db-heading);
  }

  &[aria-current='page'],
  &[aria-current='page'] a {
    color: var(--db-heading);
    font-weight: 500;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;
