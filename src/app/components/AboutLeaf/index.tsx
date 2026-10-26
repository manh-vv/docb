/**
 *
 * AboutLeaf
 *
 * A green leaf in the bottom-right corner of every page. It opens a short note on
 * what docb is and why it is safe to use: no server of its own, everything stays in the browser.
 *
 */
import React, { memo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { compact } from 'styles/media';

import { Modal } from '../Modal';

const SOURCE_URL = 'https://github.com/manh-vv/docb';

function Leaf({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19L2.8 21.2" stroke="var(--db-leaf)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 19C3.5 11.5 8 4.5 19.8 3.4C20.8 14 14 20.6 5 19Z" fill="var(--db-leaf)" />
      <path
        d="M5 19C8.5 15 12.5 10.8 16.8 7.2"
        fill="none"
        stroke="var(--db-surface)"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M8.2 10.2C9.6 7.8 12.2 6.1 15.4 5.4"
        fill="none"
        stroke="var(--db-surface)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

const POINTS = [
  {
    title: 'Runs in your browser.',
    text: 'docb is a static page with no server of its own, so nothing you read or type is sent to us.',
  },
  {
    title: 'Nothing in between.',
    text: 'Repositories and files load straight from GitHub, typefaces from Google Fonts, and images from wherever a document links them.',
  },
  {
    title: 'Your data stays here.',
    text: 'Settings, cached pages and your GitHub token, if you sign in, live in this browser’s storage. The token is only ever sent to api.github.com.',
  },
  {
    title: 'No tracking.',
    text: 'No analytics, no ads, no cookies, and no account needed for public repositories.',
  },
];

export const AboutLeaf = memo(() => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        aria-label="About docb: safe and private"
        title="About docb: safe and private"
        onClick={() => setOpen(true)}
      >
        <Leaf size={24} />
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="docb"
        icon={
          <HeroLeaf>
            <Leaf size={40} />
          </HeroLeaf>
        }
      >
        <Lead>A markdown reader for GitHub repositories that runs entirely in your browser.</Lead>

        <Section>
          <SectionTitle>Safe and private</SectionTitle>
          <Points>
            {POINTS.map(point => (
              <li key={point.title}>
                <Bullet>
                  <Leaf size={14} />
                </Bullet>
                <span>
                  <b>{point.title}</b> {point.text}
                </span>
              </li>
            ))}
            <li>
              <Bullet>
                <Leaf size={14} />
              </Bullet>
              <span>
                <b>Open source.</b>{' '}
                <a href={SOURCE_URL} target="_blank" rel="noreferrer">
                  Read the code on GitHub
                </a>
                .
              </span>
            </li>
          </Points>
        </Section>
      </Modal>
    </>
  );
});

const sway = keyframes`
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-12deg); }
  70% { transform: rotate(9deg); }
`;

const Button = styled.button`
  position: fixed;
  right: 20px;
  bottom: 20px;
  /* above the page, below the contents drawer on phones */
  z-index: 20;
  display: inline-grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid var(--db-border);
  border-radius: 50%;
  background: var(--db-surface);
  box-shadow: var(--db-shadow-lg);
  transition: transform 0.2s var(--db-ease);

  svg {
    transform-origin: 20% 85%;
  }

  &:hover,
  &:focus-visible {
    transform: scale(1.12);
    background: var(--db-leaf-soft);
  }

  &:hover svg {
    animation: ${sway} 1.4s var(--db-ease) infinite;
  }

  @media ${compact} {
    right: 14px;
    bottom: 14px;
  }

  @media print {
    display: none;
  }
`;

const HeroLeaf = styled.span`
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--db-leaf-soft);
`;

const Lead = styled.p`
  margin: 0 0 20px;
  text-align: center;
  color: var(--db-text-muted);
`;

const Section = styled.section`
  padding: 16px 18px;
  border-radius: var(--db-radius);
  background: var(--db-surface-muted);
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--db-leaf);
`;

const Points = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;

  li {
    display: flex;
    gap: 10px;
  }

  li + li {
    margin-top: 9px;
  }

  b {
    color: var(--db-heading);
  }
`;

const Bullet = styled.span`
  flex-shrink: 0;
  padding-top: 3px;
`;
