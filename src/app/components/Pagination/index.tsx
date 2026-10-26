import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';
import styled from 'styled-components';

type OnClick = ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined;

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
      <Nav aria-label="Pages">
        <PageButton type="button" aria-label="Previous" disabled={!hasBack} onClick={onBackPage}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </PageButton>

        <PageSelect
          className="form-select"
          aria-label="Choose page"
          onChange={handleSelect}
          value={`${curPage}`}
        >
          {displayPageNum.map(page => (
            <option key={page} value={`${page}`}>
              Page {page}
            </option>
          ))}
        </PageSelect>

        <PageButton type="button" aria-label="Next" disabled={!hasNext} onClick={onNextPage}>
          <FontAwesomeIcon icon={faChevronRight} />
        </PageButton>
      </Nav>
    );
  },
);

const Nav = styled.nav`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--db-border);
  border-radius: 12px;
  background: var(--db-surface);
  box-shadow: var(--db-shadow-sm);
`;

const PageButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  font-size: 12px;
  color: var(--db-text);
  background: transparent;
  transition: background 0.15s var(--db-ease);

  &:hover:not(:disabled) {
    background: var(--db-surface-muted);
  }

  &:disabled {
    color: var(--db-border-strong);
    cursor: not-allowed;
  }
`;

const PageSelect = styled.select`
  &.form-select {
    width: auto;
    padding: 6px 32px 6px 12px;
    border: 0;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--db-text);
    background-color: var(--db-surface-muted);
    box-shadow: none;
  }
`;
