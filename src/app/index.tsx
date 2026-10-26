import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router';
import { GlobalStyle } from 'styles/global-styles';
import removeLastSlash from 'utils/removeLastSlash';

import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { DocViewer } from './containers/DocViewer/Loadable';
import { HomePage } from './containers/HomePage/Loadable';

/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */
export function App() {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter basename={removeLastSlash(import.meta.env.BASE_URL)}>
      <Helmet htmlAttributes={{ lang: i18n.language }} />

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/**
         * Provider can be: github, gitlab
         * Each username is a library which contains many collection of books
         * Each repository is a collection which is a folder
         * Each collection has one or many markdown files
         * Each file is a chapter
         * Each files contains one or may sub chapters
         */}
        <Route
          path="/viewer/:provider/:username/:repository?/:base64FilePath?"
          element={<DocViewer />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <GlobalStyle />
    </BrowserRouter>
  );
}
