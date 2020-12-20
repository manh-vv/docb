import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import keepTextLength from 'utils/keepTextLength';

/**
 *
 * SidebarMenu
 *
 */
interface MenuItemProps {
  id: string;
  text: string;
  type: 'branch' | 'file';
  level?: number;
  childItems?: MenuItemProps[];
  /**
   * Git url: with this URL we can get the file content
   */
  url?: string;
  /**
   * menu href: we can contruct menu link with this value
   */
  href?: string;
  onSelect?: Function;
}
interface Props {
  menuItems?: MenuItemProps[];
  level?: number;
  onSelect?: Function;
}

const MenuItemV = memo((props: MenuItemProps) => {
  const { id, text, childItems, type, onSelect, href, level = 0 } = props;
  const hasChildren = childItems && childItems.length > 0;
  const [showChildren, setShowChildren] = useState(false);
  function handleShowChildren(e) {
    if (type === 'branch') {
      e.preventDefault();
      setShowChildren(!showChildren);
    }
  }
  return (
    <>
      <MenuItem onClick={handleShowChildren} type={type}>
        {type === 'branch' ? (
          <i>{keepTextLength(text, '...')}</i>
        ) : type === 'file' ? (
          <Link to={href as string}>
            <b
              style={{
                cursor: 'pointer',
              }}
            >
              {keepTextLength(text, '...')}
            </b>
          </Link>
        ) : (
          <MenuItemContent href={`#${id}`} key={id}>
            {keepTextLength(text, '...')}
          </MenuItemContent>
        )}

        {hasChildren && <Svg onClick={handleShowChildren} showChildren={showChildren} />}
      </MenuItem>
      {showChildren && <SidebarMenu menuItems={childItems} onSelect={onSelect} level={level + 1} />}
    </>
  );
});

const MenuItem = styled(({ className, onClick, children }) => (
  <div className={className} onClick={onClick}>
    {children}
  </div>
))`
  display: flex;
  justify-content: space-between;

  font-family: Montserrat, sans-serif;
  color: rgb(50, 50, 159);
  font-size: 0.929em;
  padding: 12.5px 20px;

  :hover {
    background-color: #ededed;
  }

  cursor: ${({ type }) => type === 'branch' && 'pointer'};
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

const Svg = styled(({ className, onClick }) => (
  <svg
    className={className}
    onClick={onClick}
    version="1.1"
    viewBox="0 0 24 24"
    x="0"
    y="0"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <polygon points="17.3 8.3 12 13.6 6.7 8.3 5.3 9.7 12 16.4 18.7 9.7"></polygon>
  </svg>
))`
  height: 1.5em;
  width: 1.5em;
  :hover {
    cursor: pointer;
    background-color: #dddddd;
  }
  transform: rotate(${props => (props.showChildren ? 0 : -90)}deg);
`;

export const SidebarMenu = memo((props: Props) => {
  const { menuItems = [], onSelect, level = 0 } = props;

  return (
    <MenuContainer style={{ marginLeft: `${level}em` }}>
      {menuItems.map(item => (
        <MenuItemV {...item} key={item.id} onSelect={onSelect} level={level} />
      ))}
    </MenuContainer>
  );
});

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
`;
