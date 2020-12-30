import React, { memo } from 'react';

type OnClick =
  | ((event: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => void)
  | undefined;

interface Props {
  perPage?: number;
  curPage?: number;
  totalPage?: number;
  hasNext: boolean;
  hasBack: boolean;
  onBackPage: OnClick;
  onNextPage: OnClick;
}

export const Pagination = memo(({ hasNext, hasBack, onBackPage, onNextPage }: Props) => {
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
          <div
            className={`page-link ${hasNext ? '' : 'disabled'}`}
            aria-label="Next"
            onClick={hasNext ? onNextPage : undefined}
          >
            <span aria-hidden="true">&raquo;</span>
          </div>
        </li>
      </ul>
    </nav>
  );
});
