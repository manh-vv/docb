import React, { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { MenuItem } from 'types/MenuItem';
import keepTextLength from 'utils/keepTextLength';

import { ReactComponent as Arrow } from './assets/arrow.svg';
import db from 'store/db';

/**
 *
 * SidebarMenu
 *
 */
interface Props {
  menuItems?: MenuItem[];
  onSelect?: Function;
}

/**
 * Recursive component to render menu items with proper tree structure
 */
const MenuItemView = memo((props: { menuItem: MenuItem; index: number; onClick?: Function; allItems: MenuItem[] }) => {
  const {
    menuItem,
    index,
    onClick,
    allItems,
  } = props;

  const [children, setChildren] = useState<MenuItem[]>([]);
  const hasChildren = menuItem.childIds && menuItem.childIds.length > 0;

  // Load children from database when needed
  useEffect(() => {
    if (hasChildren) {
      const loadChildren = async () => {
        const childItems = await db.menuItems.where('parentId').equals(menuItem.id).toArray();
        // Sort by order
        childItems.sort((a, b) => (a.order || 0) - (b.order || 0));
        setChildren(childItems);
      };
      loadChildren();
    }
  }, [hasChildren, menuItem.id]);

  function handleOnClick(e: React.MouseEvent) {
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

  const shortText = keepTextLength(menuItem.text, '...');

  const style: React.CSSProperties = {};

  if (menuItem.level && menuItem.level > 0) {
    style.marginLeft = `${menuItem.level * 1.2}em`;
  }

  const type = menuItem.type;

  if (type === 'branch') {
    style.cursor = 'pointer';
  }

  if (menuItem.active && !hasChildren) {
    style.backgroundColor = '#ededed';
  }

  return (
    <>
      <MenuItemDiv onClick={handleOnClick} style={style} className={menuItem.active ? 'active' : ''}>
        {type === 'branch' ? (
          <i>{shortText}</i>
        ) : type === 'file' ? (
          <Link to={menuItem.href as string}>
            <b>{shortText}</b>
          </Link>
        ) : (
          <MenuItemContent href={`#${menuItem.id}`} key={menuItem.id}>
            {shortText}
          </MenuItemContent>
        )}

        {hasChildren && (
          <Svg
            style={{
              transform: `rotate(${menuItem.active ? 0 : -90}deg)`,
              transition: 'transform 0.2s ease',
            }}
          />
        )}
      </MenuItemDiv>

      {/* Recursively render children if this item is active and has children */}
      {hasChildren && menuItem.active && children.map((child, childIndex) => (
        <MenuItemView
          key={child.id}
          menuItem={child}
          index={childIndex}
          onClick={onClick}
          allItems={allItems}
        />
      ))}
    </>
  );
});

const MenuItemDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-family: Montserrat, sans-serif;
  color: rgb(50, 50, 159);
  font-size: 0.929em;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;

  transition: background-color 0.15s ease;

  :hover {
    background-color: #f5f5f5;
  }

  &.active {
    background-color: #e8f0fe;
    border-left: 3px solid #1a73e8;
    padding-left: 13px;
  }
`;

const MenuItemContent = styled.a`
  text-decoration: none;
  color: inherit;
  flex: 1;

  &:hover {
    text-decoration: underline;
  }
`;

const Svg = styled(Arrow)`
  height: 1.2em;
  width: 1.2em;
  flex-shrink: 0;
  margin-left: 8px;
  color: #666;

  :hover {
    cursor: pointer;
    color: #333;
  }
`;

const MenuHeader = styled.div`
  padding: 16px 20px;
  font-size: 0.85em;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
`;

export const SidebarMenu = memo((props: Props) => {
  const { menuItems = [], onSelect } = props;

  return (
    <MenuContainer>
      <MenuHeader>Contents</MenuHeader>
      {menuItems.map((item, index) => (
        <MenuItemView 
          key={item.id} 
          menuItem={item} 
          index={index} 
          onClick={onSelect}
          allItems={menuItems}
        />
      ))}
    </MenuContainer>
  );
});

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  background-color: #fff;
`;
