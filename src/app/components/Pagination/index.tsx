import React, { memo } from 'react';

type OnClick =
  | ((event: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => void)
  | undefined;

interface Props {
  perPage?: number;
  curPage: number;
  totalPage: number;
  hasNext: boolean;
  hasBack: boolean;
  onBackPage: OnClick;
  onNextPage: OnClick;
  onChoosePage: (page: number) => void;
}

export const Pagination = memo(
  ({ hasNext, hasBack, onBackPage, onNextPage, onChoosePage, totalPage, curPage }: Props) => {
    const displayPageNum: number[] = [];
    for (let p = 1; p <= totalPage; p++) {
      displayPageNum.push(p);
    }

    function handleSelect(e) {
      onChoosePage(+e.target.value);
    }

    return (
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          <li className={`page-item ${hasBack ? '' : 'disabled'}`}>
            <div
              className="page-link"
              aria-label="Previous"
              onClick={hasBack ? onBackPage : undefined}
            >
              <span aria-hidden="true">&laquo;</span>
            </div>
          </li>

          <li className="page-item">
            <select
              className="form-select"
              aria-label="chose page"
              onChange={handleSelect}
              value={`${curPage}`}
            >
              {displayPageNum.map(page => (
                <option key={page} value={`${page}`}>
                  {page}
                </option>
              ))}
            </select>
          </li>

          <li className={`page-item ${hasNext ? '' : 'disabled'}`}>
            <div className="page-link" aria-label="Next" onClick={hasNext ? onNextPage : undefined}>
              <span aria-hidden="true">&raquo;</span>
            </div>
          </li>
        </ul>
      </nav>
    );
  },
);
