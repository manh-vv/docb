/**
 *
 * BookCollectionView
 *
 */
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';

interface Props {
  item: any;
  onSelect?: Function;
}

export const BookCollectionView = memo((props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, i18n } = useTranslation();
  const { item, onSelect } = props;

  return (
    <Div>
      <p>{item.name}</p>
      <p>{item.default_branch}</p>
      <p
        onClick={e => {
          e.preventDefault();
          if (onSelect) {
            onSelect(item);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        Open
      </p>
    </Div>
  );
});

const Div = styled.div`
  width: 160px;
  height: 240px;
  border: 1px solid #daa;
  padding: 0.8em 1em;
  margin-left: 0.5em;
  margin-bottom: 1em;
`;
