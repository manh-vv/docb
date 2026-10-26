/**
 *
 * Card
 *
 * A GitHub account: avatar, name and bio, linking to its library
 *
 */
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';

interface Props {
  /**
   * image source
   */
  img: string;
  href: string;
  name: string;
  desc: string;
  style?: {
    [key: string]: any;
  };
}

export const Card = memo((props: Props) => {
  const { img, href, name, desc, style } = props;
  return (
    <Wrapper to={href} style={style} className="card">
      <Avatar src={img} alt="" />
      <Name className="card-title">{name}</Name>
      <Desc>{desc}</Desc>
      <Cta>
        Browse library <FontAwesomeIcon icon={faArrowRight} />
      </Cta>
    </Wrapper>
  );
});

const Cta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--db-accent);

  svg {
    transition: transform 0.2s var(--db-ease);
  }
`;

const Wrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px;
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius-lg);
  background: var(--db-surface);
  box-shadow: var(--db-shadow-sm);
  color: var(--db-text);
  text-decoration: none;
  transition:
    transform 0.2s var(--db-ease),
    box-shadow 0.2s var(--db-ease),
    border-color 0.2s var(--db-ease);

  &:hover {
    transform: translateY(-2px);
    border-color: var(--db-border-strong);
    box-shadow: var(--db-shadow-lg);
    color: var(--db-text);
  }

  &:hover ${Cta} svg {
    transform: translateX(3px);
  }
`;

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  background: var(--db-surface-muted);
  border: 1px solid var(--db-border);
`;

const Name = styled.h3`
  margin: 16px 0 4px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--db-heading);
`;

const Desc = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
  font-size: 13.5px;
  color: var(--db-text-muted);
`;
