import { bookCollectionActions as actions, initialState, reducer } from '../slice';

const items = (n: number) => Array.from({ length: n }, (_, id) => ({ id }));

describe('bookCollection slice', () => {
  it('derives the pages from the repo count', () => {
    const state = reducer(
      initialState,
      actions.success({ curPage: 1, perPage: 40, items: items(40), repoCount: 101 }),
    );
    expect(state).toMatchObject({ totalPage: 3, hasNext: true, hasBack: false });

    const last = reducer(
      state,
      actions.success({ curPage: 3, perPage: 40, items: items(21), repoCount: 101 }),
    );
    expect(last).toMatchObject({ totalPage: 3, hasNext: false, hasBack: true });
  });

  it('has no next page when the repos fill exactly one page', () => {
    const state = reducer(
      initialState,
      actions.success({ curPage: 1, perPage: 40, items: items(40), repoCount: 40 }),
    );
    expect(state).toMatchObject({ totalPage: 1, hasNext: false });
  });

  it('guesses one more page from a full page when the count is unknown', () => {
    const state = reducer(
      initialState,
      actions.success({ curPage: 2, perPage: 40, items: items(40) }),
    );
    expect(state).toMatchObject({ totalPage: 3, hasNext: true, hasBack: true });
  });
});
