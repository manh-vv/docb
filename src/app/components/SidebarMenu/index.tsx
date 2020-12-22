import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { MenuItem } from 'types/MenuItem';
import keepTextLength from 'utils/keepTextLength';

import { ReactComponent as Arrow } from './assets/arrow.svg';

/**
 *
 * SidebarMenu
 *
 */
interface Props {
  menuItems?: MenuItem[];
  onSelect?: Function;
}

const MenuItemView = memo((props: { menuItem: MenuItem; index: number; onClick?: Function }) => {
  const {
    menuItem: { id, text, type, href, level = 0, active, childIds },
    index,
    onClick,
  } = props;

  const hasChildren = childIds && childIds.length > 0;

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

  const shortText = keepTextLength(text, '...');

  const style: any = {};

  if (level > 0) {
    style.marginLeft = `${level * 1}em`;
  }

  if (type === 'branch') {
    style.cursor = 'pointer';
  }

  if (active) {
    style.borderBottom = '1px solid black';
  }

  return (
    <MenuItemDiv onClick={handleOnClick} style={style}>
      {type === 'branch' ? (
        <i>{shortText}</i>
      ) : type === 'file' ? (
        <Link to={href as string}>
          <b>{shortText}</b>
        </Link>
      ) : (
        <MenuItemContent href={`#${id}`} key={id}>
          {shortText}
        </MenuItemContent>
      )}

      {hasChildren && (
        <Svg
          style={{
            transform: `rotate(${active ? 0 : -90}deg)`,
          }}
        />
      )}
    </MenuItemDiv>
  );
});

const MenuItemDiv = styled.div`
  display: flex;
  justify-content: space-between;

  font-family: Montserrat, sans-serif;
  color: rgb(50, 50, 159);
  font-size: 0.929em;
  padding: 12.5px 20px;

  :hover {
    background-color: #ededed;
  }
`;

const MenuItemContent = styled.a`
  text-decoration: none;
  color: rgb(50, 50, 159);

  :focus {
    outline: none;
  }

  :visited {
    text-decoration: none;
    color: rgb(50, 50, 159);
  }
`;

const Svg = styled(Arrow)`
  height: 1.5em;
  width: 1.5em;
  :hover {
    cursor: pointer;
    background-color: #dddddd;
  }
`;

export const SidebarMenu = memo((props: Props) => {
  const { menuItems = [], onSelect } = props;

  return (
    <MenuContainer>
      {menuItems.map((item, index) => (
        <MenuItemView key={item.id} menuItem={item} index={index} onClick={onSelect} />
      ))}
    </MenuContainer>
  );
});

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
`;
