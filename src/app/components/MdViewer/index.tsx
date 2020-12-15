import hljs from 'highlight.js';
import marked from 'marked';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';
import keepTextLength from 'utils/keepTextLength';

/**
 *
 * MdViewer
 *
 */
interface Props {
  content: string;
  setMenuItems?: (items: any[]) => any;
}

marked.use({
  highlight: (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(validLanguage, code).value;
  },
});

function mapMenuItem(items: any[]) {
  const rs: any[] = [];
  const s: any[] = [];

  items
    .map(item => ({ ...item }))
    .forEach(item => {
      if (s.length < 1) {
        s.push(item);
        rs.push(item);
      } else {
        const cTop = s[s.length - 1];
        if (cTop.level < item.level) {
          s.push(item);

          if (!cTop.children) {
            cTop.children = [];
          }

          cTop.children.push(item);
        } else {
          s.pop();
          s.push(item);
          rs.push(item);
        }
      }
    });

  return rs;
}

const menuItems: any[] = [];

// marked.use({
//   // Override function
//   renderer: {
//     heading(text, level, raw, slugger) {
//       const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
//       const id = slugger.slug(keepTextLength(escapedText));
//       const rs = `
//             <h${level} id="${id}">
//               <a name="${escapedText}" class="anchor" href="#${escapedText}">
//                 <span class="header-link"></span>
//               </a>
//               ${text}
//             </h${level}>
//           `;

//       menuItems.push({
//         id,
//         text,
//         level,
//         raw,
//         render: rs,
//       });

//       return rs;
//     },
//   },
// });

/**
 * this component response for getting MD content and interpret it
 * on the screen
 */
export const MdViewer = memo((props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, i18n } = useTranslation();
  const { content, setMenuItems } = props;

  const divEl = useRef(null);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    setHtmlContent(marked(content));

    if (setMenuItems) {
      setMenuItems(mapMenuItem(menuItems));
    }
    // eslint-disable-next-line
  }, [content]);

  return <Paper ref={divEl} dangerouslySetInnerHTML={{ __html: htmlContent }}></Paper>;
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
