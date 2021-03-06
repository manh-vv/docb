import { BookCollectionView } from 'app/components/BookCollectionView';
import { Pagination } from 'app/components/Pagination';
import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import removeLastSlash from 'utils/removeLastSlash';
import useQueryParams from 'utils/useQueryParams';

import { bookCollectionSaga } from './saga';
import {
  selectBookCollection,
  selectCurPage,
  selectHasBack,
  selectHasNext,
  selectTotalPage,
} from './selectors';
import { bookCollectionActions as actions, reducer, sliceKey } from './slice';

interface Props {
  provider: string;
  username: string;
  onSelect?: Function;
}

export const BookCollection = memo((props: Props) => {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: bookCollectionSaga });

  const bookCollection = useSelector(selectBookCollection);
  const hasNext = useSelector(selectHasNext);
  const hasBack = useSelector(selectHasBack);
  const curPage = useSelector(selectCurPage);
  const totalPage = useSelector(selectTotalPage);

  const dispatch = useDispatch();

  const { provider, username, onSelect } = props;
  const history = useHistory();
  const location = useLocation<Location>();
  const usp = useQueryParams();

  useEffect(() => {
    const page = usp.get('page');
    let nextPage = curPage;
    if (page) {
      nextPage = +page;
    }
    dispatch(actions.fetchBookCollection({ provider, username, nextPage }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, username]);

  function handleOnSelect(item) {
    history.push(`${removeLastSlash(location.pathname)}/${item.name}`);
  }

  function onNextPage() {
    dispatch(actions.fetchBookCollection({ provider, username, nextPage: curPage + 1 }));
  }

  function onBackPage() {
    dispatch(actions.fetchBookCollection({ provider, username, nextPage: curPage - 1 }));
  }

  function onChoosePage(page) {
    dispatch(actions.fetchBookCollection({ provider, username, nextPage: page }));
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <Div>
            {bookCollection.total > 0 &&
              bookCollection.items.map(item => (
                <BookCollectionView
                  key={item.id}
                  item={item}
                  onSelect={onSelect || handleOnSelect}
                />
              ))}
          </Div>
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <Pagination
          curPage={curPage}
          totalPage={totalPage}
          hasNext={hasNext}
          hasBack={hasBack}
          onNextPage={onNextPage}
          onBackPage={onBackPage}
          onChoosePage={onChoosePage}
        />
      </div>
    </div>
  );
});

const Div = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 1em 1.5em 0 1.5em;
`;
