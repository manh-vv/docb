import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { compact } from 'styles/media';
import NOPE_FN from 'utils/NOPE_FN';

interface Props {
  id: string;
  htmlContent: string;
  afterRender?: Function;
}

/**
 * this component response for getting MD content and interpret it
 * on the screen
 */
export const MdViewer = (props: Props) => {
  const { id, htmlContent, afterRender = NOPE_FN } = props;
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => afterRender(), [htmlContent]);

  // links to other chapters carry their router path (see utils/rewriteMarkdownLinks)
  function handleClick(e: React.MouseEvent) {
    const link = (e.target as Element).closest('a[data-route]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigate(link.getAttribute('data-route') as string);
  }

  return (
    <Paper id={id} onClick={handleClick} dangerouslySetInnerHTML={{ __html: htmlContent }}></Paper>
  );
};

/** Typography for the HTML that GitHub's markdown API returns */
const Paper = styled.div`
  font-family: var(--db-font-reading);
  font-size: 17px;
  line-height: 1.75;
  color: var(--db-text);
  overflow-wrap: break-word;

  @media ${compact} {
    font-size: 16px;
    line-height: 1.7;
  }

  > :first-child,
  > .markdown-heading:first-child > :first-child {
    margin-top: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 2em 0 0.6em;
    font-family: var(--db-font-reading);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.015em;
    color: var(--db-heading);
  }

  h1,
  h2 {
    font-weight: var(--db-weight-display);
  }

  h1 {
    font-size: 2.3em;
    letter-spacing: -0.03em;
  }

  h2 {
    font-size: 1.6em;
    letter-spacing: -0.02em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--db-border);
  }

  h3 {
    font-size: 1.25em;
    font-weight: 500;
  }

  h4,
  h5,
  h6 {
    font-family: var(--db-font-ui);
    font-size: 1em;
    letter-spacing: 0;
  }

  /* GitHub wraps each heading with its permalink anchor */
  .markdown-heading {
    position: relative;
  }

  .anchor {
    position: absolute;
    top: 50%;
    left: -1.1em;
    opacity: 0;
    text-decoration: none;
    transform: translateY(-50%);
    transition: opacity 0.15s var(--db-ease);
  }

  .anchor::before {
    content: '#';
    font-family: var(--db-font-ui);
    font-size: 0.8em;
    color: var(--db-text-muted);
  }

  .markdown-heading:hover .anchor {
    opacity: 1;
  }

  /* no room for the hover mark beside headings on phones; the anchor stays as a scroll target */
  @media ${compact} {
    .anchor::before {
      content: none;
    }
  }

  p,
  ul,
  ol,
  blockquote,
  pre,
  table,
  details {
    margin: 0 0 1.15em;
  }

  ul,
  ol {
    padding-left: 1.5em;
  }

  li + li,
  li > ul,
  li > ol {
    margin-top: 0.3em;
  }

  li > ul,
  li > ol {
    margin-bottom: 0;
  }

  a {
    color: var(--db-accent);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    text-decoration-color: color-mix(in srgb, var(--db-accent) 40%, transparent);
  }

  a:hover {
    text-decoration-color: currentColor;
  }

  strong {
    font-weight: 600;
    color: var(--db-heading);
  }

  blockquote > :last-child {
    margin-bottom: 0;
  }

  blockquote {
    padding: 0.2em 0 0.2em 1.1em;
    border-left: 3px solid var(--db-accent);
    font-style: italic;
    color: var(--db-text-muted);
  }

  hr {
    height: 1px;
    margin: 2.5em 0;
    border: 0;
    background: var(--db-border);
    opacity: 1;
  }

  img {
    max-width: 100%;
    border-radius: var(--db-radius);
  }

  code,
  kbd,
  pre {
    font-family: var(--db-font-mono);
  }

  code {
    padding: 0.15em 0.4em;
    border-radius: 5px;
    font-size: 0.82em;
    color: var(--db-heading);
    background: var(--db-code-bg);
  }

  pre {
    padding: 18px 20px;
    overflow-x: auto;
    border: 1px solid var(--db-border);
    border-radius: var(--db-radius);
    font-size: 14px;
    line-height: 1.6;
    background: var(--db-code-bg);
  }

  pre code {
    padding: 0;
    font-size: inherit;
    background: none;
  }

  kbd {
    padding: 0.1em 0.45em;
    border: 1px solid var(--db-border-strong);
    border-bottom-width: 2px;
    border-radius: 5px;
    font-size: 0.8em;
    color: var(--db-heading);
    background: var(--db-surface);
  }

  table {
    display: block;
    width: max-content;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    font-family: var(--db-font-ui);
    font-size: 15px;
  }

  th,
  td {
    padding: 8px 14px;
    border: 1px solid var(--db-border);
  }

  th {
    font-weight: 600;
    background: var(--db-surface-muted);
  }

  tr:nth-child(2n) td {
    background: color-mix(in srgb, var(--db-surface-muted) 45%, transparent);
  }

  .task-list-item {
    list-style: none;
  }

  .task-list-item input {
    margin: 0 0.5em 0 -1.3em;
    accent-color: var(--db-accent);
  }
`;
