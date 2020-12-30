import { faFish } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';
import styled from 'styled-components/macro';
import keepTextLength from 'utils/keepTextLength';

interface BookItem {
  provider: string;
  name: string;
  description: string;
  default_branch: string;
  owner: {
    login: string;
  };
}
interface Props {
  item: BookItem;
  onSelect?: Function;
}

export const BookCollectionView = memo((props: Props) => {
  const { item, onSelect } = props;

  function handleClick(e) {
    e.preventDefault();
    if (onSelect) {
      onSelect(item);
    }
  }

  return (
    <Div>
      <div className="header">{keepTextLength(`DOCB: ${item.owner.login}`, '...', 48)}</div>
      <div className="title">{keepTextLength(item.name, '...', 15)}</div>
      <div className="desc">{keepTextLength(item.description, '...', 100) || item.name}</div>
      <div className="default-branch">{item.default_branch}</div>
      <button className="btn btn-outline-primary btn-sm open-button" onClick={handleClick}>
        <FontAwesomeIcon icon={faFish} />
      </button>
    </Div>
  );
});

const Div = styled.div`
  width: 160px;
  height: 240px;
  border: 1px solid black;
  position: relative;
  margin-bottom: 1em;

  .header {
    width: 90%;
    margin: auto;
    height: 1.5em;
    background-color: #212121;
    font-size: 8px;
    color: white;
    margin-bottom: 1em;
    padding-left: 5px;
  }

  .title {
    font-family: 'Shadows Into Light', cursive;
    text-align: center;
    text-transform: capitalize;
    font-size: 1.5em;
    color: #ff5722;
  }

  .desc {
    background-color: #1a237e;
    color: white;
    font-size: 10px;
    padding: 5px;
    position: absolute;
    bottom: 50px;
    height: 80px;
    width: 100%;
    left: 0;
  }

  .open-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  .default-branch {
    position: absolute;
    bottom: 5px;
    left: 5px;
    font-size: 8px;
    font-style: italic;
    color: #ff5722;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 6em;
  }
`;
