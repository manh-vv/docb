import React, { memo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
  children?: MenuItemProps[];
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
  onSelect?: Function;
}

const MenuItemV = memo((props: MenuItemProps) => {
  const { id, text, children, type, onSelect, href } = props;
  const hasChildren = children && children.length > 0;
  const [showChildren, setShowChildren] = useState(false);
  return (
    <>
      <MenuItem>
        {type === 'branch' ? (
          <i
            onClick={() => setShowChildren(!showChildren)}
            style={{
              cursor: 'pointer',
            }}
          >
            {keepTextLength(text, '...')}
          </i>
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

        {hasChildren && (
          <Svg onClick={() => setShowChildren(!showChildren)} showChildren={showChildren} />
        )}
      </MenuItem>
      {showChildren && <SidebarMenu menuItems={children} onSelect={onSelect} />}
    </>
  );
});

const MenuItem = styled.div`
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
  const { menuItems, onSelect } = props;

  return (
    <>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700"
          rel="stylesheet"
        ></link>
      </Helmet>
      {menuItems && (
        <MenuContainer>
          {menuItems.map(item => (
            <MenuItemV {...item} key={item.id} onSelect={onSelect} />
          ))}
        </MenuContainer>
      )}
    </>
  );
});

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
`;