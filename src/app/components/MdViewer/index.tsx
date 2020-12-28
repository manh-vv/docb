import React, { useEffect } from 'react';
import styled from 'styled-components/macro';
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => afterRender(), [htmlContent]);

  return <Paper id={id} dangerouslySetInnerHTML={{ __html: htmlContent }}></Paper>;
};

const Paper = styled.div`
  box-shadow: 0px 0px 6px 2px rgba(221, 221, 221, 1);
  flex: 0 0 800px;

  overflow-y: scroll hidden;

  margin-left: 2.5em;
  margin-right: 2em;
  margin-top: 1.5em;
  margin-bottom: 1em;

  padding-left: 1.6em;
  padding-right: 1.2em;
  padding-top: 2em;
  padding-bottom: 1.2em;
`;
