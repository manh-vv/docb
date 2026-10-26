import {
  faBookOpen,
  faChevronRight,
  faFileLines,
  faFolder,
  faFolderOpen,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import styled, { css } from 'styled-components';
import { ROOT_ID } from 'types/createBranch';
import { MenuItem } from 'types/MenuItem';

/**
 *
 * SidebarMenu
 *
 */
interface Props {
  menuItems?: MenuItem[];
  onSelect?: Function;
}

/** Chapter links carry an encoded base64 segment, so compare paths decoded */
function safeDecode(path = ''): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function iconFor({ id, type, active }: MenuItem) {
  if (type === 'hash') return faHashtag;
  if (type === 'file') return faFileLines;
  if (id.endsWith(`:${ROOT_ID}`)) return faBookOpen;
  return active ? faFolderOpen : faFolder;
}

interface ItemProps {
  menuItem: MenuItem;
  index: number;
  /** the chapter shown in the reader */
  isOpenChapter: boolean;
  onClick?: Function;
}

const MenuItemView = memo((props: ItemProps) => {
  const {
    menuItem,
    menuItem: { id, text, type, href, level = 0, active, childIds },
    index,
    isOpenChapter,
    onClick,
  } = props;

  const hasChildren = !!childIds && childIds.length > 0;
  const current = type === 'file' ? isOpenChapter : active && !hasChildren;

  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpenChapter) {
      rowRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpenChapter]);

  function handleOnClick(e) {
    if (onClick) {
      if (type === 'branch') {
        e.preventDefault();
      }

      onClick({
        menuItem: props.menuItem,
        index,
      });
    }
  }

  const label = (
    <>
      <Icon $type={type}>
        <FontAwesomeIcon icon={iconFor(menuItem)} fixedWidth />
      </Icon>
      <Text>{text}</Text>
    </>
  );

  return (
    <Row
      ref={rowRef}
      onClick={handleOnClick}
      style={{ paddingLeft: `${12 + level * 14}px` }}
      $current={current}
      $type={type}
      title={text}
    >
      {type === 'branch' ? (
        <BranchLabel role="button" tabIndex={0} aria-expanded={active}>
          {label}
        </BranchLabel>
      ) : type === 'file' ? (
        <ItemLink as={Link} to={href as string} aria-current={current ? 'page' : undefined}>
          {label}
        </ItemLink>
      ) : (
        <ItemLink href={href} key={id}>
          {label}
        </ItemLink>
      )}

      {hasChildren && (
        <Chevron $open={active} aria-hidden="true">
          <FontAwesomeIcon icon={faChevronRight} />
        </Chevron>
      )}
    </Row>
  );
});

type RowProps = { $current?: boolean; $type: MenuItem['type'] };

const Row = styled.div<RowProps>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 1px 8px;
  padding: 6px 10px 6px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--db-text);
  cursor: pointer;
  transition:
    background 0.12s var(--db-ease),
    color 0.12s var(--db-ease);

  &:hover {
    background: var(--db-surface-muted);
  }

  ${p =>
    p.$type === 'hash' &&
    css`
      font-size: 13px;
      color: var(--db-text-muted);
    `}

  ${p =>
    p.$current &&
    css`
      color: var(--db-accent);
      background: var(--db-accent-soft);

      &:hover {
        background: var(--db-accent-soft);
      }

      &::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 6px;
        bottom: 6px;
        width: 3px;
        border-radius: 3px;
        background: var(--db-accent);
      }
    `}
`;

const labelStyles = css`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: inherit;
  text-decoration: none;

  &:hover {
    color: inherit;
  }
`;

const BranchLabel = styled.span`
  ${labelStyles}
  font-weight: 500;
`;

const ItemLink = styled.a`
  ${labelStyles}
`;

const Icon = styled.span<{ $type: MenuItem['type'] }>`
  flex-shrink: 0;
  font-size: ${p => (p.$type === 'hash' ? '10px' : '13px')};
  color: var(--db-text-muted);
  opacity: 0.8;
`;

const Text = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Chevron = styled.span<{ $open?: boolean }>`
  flex-shrink: 0;
  font-size: 10px;
  color: var(--db-text-muted);
  transform: rotate(${p => (p.$open ? 90 : 0)}deg);
  transition: transform 0.2s var(--db-ease);
`;

export const SidebarMenu = memo((props: Props) => {
  const { menuItems = [], onSelect } = props;
  // chapters on another branch than the default one carry it as `?ref=`
  const { pathname, search } = useLocation();
  const openPath = safeDecode(pathname + search);

  return (
    <MenuContainer>
      {menuItems.map((item, index) => (
        <MenuItemView
          key={item.id}
          menuItem={item}
          index={index}
          isOpenChapter={item.type === 'file' && safeDecode(item.href) === openPath}
          onClick={onSelect}
        />
      ))}
    </MenuContainer>
  );
});

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
`;
