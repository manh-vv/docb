import { BookCollectionView } from 'app/components/BookCollectionView';
import { LoadingBox } from 'app/components/Loading';
import { Pagination } from 'app/components/Pagination';
import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import removeLastSlash from 'utils/removeLastSlash';
import useQueryParams from 'utils/useQueryParams';

import { bookCollectionSaga } from './saga';
import {
  selectBookCollection,
  selectCurPage,
  selectHasBack,
  selectHasNext,
  selectLoading,
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
  const loading = useSelector(selectLoading);

  const dispatch = useDispatch();

  const { provider, username, onSelect } = props;
  const navigate = useNavigate();
  const location = useLocation();
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
    navigate(`${removeLastSlash(location.pathname)}/${item.name}`);
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
    <Page>
      <Header>
        <div>
          <Eyebrow>Library</Eyebrow>
          <Heading>{username}</Heading>
        </div>
        <Pagination
          curPage={curPage}
          totalPage={totalPage}
          hasNext={hasNext}
          hasBack={hasBack}
          onNextPage={onNextPage}
          onBackPage={onBackPage}
          onChoosePage={onChoosePage}
        />
      </Header>

      <Grid aria-busy={loading}>
        {loading && <span className="visually-hidden">Loading books</span>}
        {loading && Array.from({ length: 12 }, (_, i) => <BookPlaceholder key={i} />)}
        {!loading &&
          bookCollection.total > 0 &&
          bookCollection.items.map(item => (
            <BookCollectionView key={item.id} item={item} onSelect={onSelect || handleOnSelect} />
          ))}
      </Grid>
    </Page>
  );
});

const Page = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 28px 72px;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
`;

const Eyebrow = styled.p`
  margin: 0 0 4px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--db-text-muted);
`;

const Heading = styled.h1`
  margin: 0;
  font-family: var(--db-font-reading);
  font-size: 34px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--db-heading);
`;

const BookPlaceholder = styled(LoadingBox)`
  height: 252px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;
