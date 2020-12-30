import { BookCollectionView } from 'app/components/BookCollectionView';
import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import removeLastSlash from 'utils/removeLastSlash';

import { bookCollectionSaga } from './saga';
import { selectBookCollection } from './selectors';
import { reducer, sliceKey } from './slice';

/**
 *
 * BookCollection
 *
 */

interface Props {
  provider: string;
  username: string;
  onSelect?: Function;
}

export const BookCollection = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: bookCollectionSaga });

  const bookCollection = useSelector(selectBookCollection);
  const dispatch = useDispatch();

  const { provider, username, onSelect } = props;
  const history = useHistory();
  const location = useLocation<Location>();

  useEffect(() => {
    dispatch({
      type: 'FETCH_BOOK_COLLECTION',
      payload: { provider, username },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, username]);

  function handleOnSelect(item) {
    history.push(`${removeLastSlash(location.pathname)}/${item.name}`);
  }

  return (
    <>
      <Div>
        {bookCollection.total > 0 &&
          bookCollection.items.map(item => (
            <BookCollectionView key={item.id} item={item} onSelect={onSelect || handleOnSelect} />
          ))}
      </Div>
    </>
  );
});

const Div = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 1em 1.5em 0 1.5em;
`;
