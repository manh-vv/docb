import React, { memo } from 'react';
import styled from 'styled-components/macro';
interface Props {
  htmlContent: string;
}

/**
 * this component response for getting MD content and interpret it
 * on the screen
 */
export const MdViewer = memo((props: Props) => {
  const { htmlContent } = props;

  return <Paper dangerouslySetInnerHTML={{ __html: htmlContent }}></Paper>;
});

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
