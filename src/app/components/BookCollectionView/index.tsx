import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';
import styled from 'styled-components';

interface BookItem {
  provider: string;
  name: string;
  description: string;
  default_branch: string;
  html_url: string;
  owner: {
    login: string;
  };
}
interface Props {
  item: BookItem;
  onSelect?: Function;
}

/** A stable hue per repository, so each book keeps its cover color */
function coverHue(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
}

export const BookCollectionView = memo((props: Props) => {
  const { item, onSelect } = props;

  function handleClick(e) {
    e.preventDefault();
    if (onSelect) {
      onSelect(item);
    }
  }

  // the GitHub link sits beside the button, not in it: a link inside a button is invalid HTML
  return (
    <Card>
      <Book type="button" onClick={handleClick} className="open-button" title={item.name}>
        <Cover style={{ '--hue': coverHue(item.name) } as React.CSSProperties} aria-hidden="true">
          <span>{item.name.charAt(0)}</span>
        </Cover>
        <Body>
          <Title className="title">{item.name}</Title>
          <Desc>{item.description || 'No description'}</Desc>
          <Branch>
            <FontAwesomeIcon icon={faCodeBranch} /> {item.default_branch}
          </Branch>
        </Body>
      </Book>
      <RepoLink
        href={item.html_url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${item.name} on GitHub`}
        title="Open on GitHub"
      >
        <FontAwesomeIcon icon={faGithub} />
      </RepoLink>
    </Card>
  );
});

const Card = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius-lg);
  background: var(--db-surface);
  box-shadow: var(--db-shadow-sm);
  transition:
    transform 0.2s var(--db-ease),
    box-shadow 0.2s var(--db-ease),
    border-color 0.2s var(--db-ease);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--db-border-strong);
    box-shadow: var(--db-shadow-lg);
  }
`;

const Book = styled.button`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 0;
  text-align: left;
  border: 0;
  background: none;
  color: var(--db-text);
`;

/* on the cover, so it reads over the cover color in every theme */
const RepoLink = styled.a`
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 16px;
  color: rgb(255 255 255 / 0.92);
  background: rgb(0 0 0 / 0.22);
  transition: background 0.15s var(--db-ease);

  &:hover,
  &:focus-visible {
    color: #fff;
    background: rgb(0 0 0 / 0.4);
  }
`;

const Cover = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  height: 112px;
  padding: 14px 16px;
  background:
    radial-gradient(
      120% 90% at 100% 0%,
      hsl(calc(var(--hue) + 40) 70% 62% / 0.85),
      transparent 60%
    ),
    linear-gradient(140deg, hsl(var(--hue) 55% 46%), hsl(calc(var(--hue) + 25) 60% 34%));

  /* the spine of the book */
  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 10px;
    width: 2px;
    background: rgb(255 255 255 / 0.22);
  }

  span {
    font-family: var(--db-font-reading);
    font-size: 44px;
    font-weight: var(--db-weight-display);
    line-height: 1;
    text-transform: uppercase;
    color: rgb(255 255 255 / 0.92);
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 16px;
`;

const Title = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--db-heading);
`;

const Desc = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
  min-height: calc(3 * 1.45em);
  font-size: 13px;
  line-height: 1.45;
  color: var(--db-text-muted);
`;

const Branch = styled.span`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  font-family: var(--db-font-mono);
  font-size: 11.5px;
  color: var(--db-text-muted);
  background: var(--db-surface-muted);
`;
