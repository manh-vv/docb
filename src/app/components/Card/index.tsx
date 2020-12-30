/**
 *
 * Card
 *
 */
import { faFish } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';

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
    <div className="card" style={style}>
      <img src={img} className="card-img-top" alt="brand" />

      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <p className="card-text">{desc}</p>
        <a href={href} className="btn btn-outline-primary">
          <FontAwesomeIcon icon={faFish} />
        </a>
      </div>
    </div>
  );
});
