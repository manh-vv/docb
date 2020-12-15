import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { GlobalStyle } from 'styles/global-styles';

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
    <BrowserRouter>
      <Helmet
        titleTemplate="%s - markdown reader"
        defaultTitle="docb"
        htmlAttributes={{ lang: i18n.language }}
      >
        <meta name="description" content="a markdown reader" />
      </Helmet>

      <Switch>
        <Route exact path="/" component={HomePage} />

        {/**
         * Provider can be: github, gitlab
         * Each username is a library which contains many collection of books
         */}
        <Route exact path="/viewer/:provider/:username" component={DocViewer} />

        {/* Each repository is a collection which is a folder */}
        <Route exact path="/viewer/:provider/:username/:repository" component={DocViewer} />

        {/**
         * Each collection has one or many markdown files
         * Each file is a chapter
         * Each files contains one or may sub chapters
         */}
        <Route
          exact
          path="/viewer/:provider/:username/:repository/:base64FilePath"
          component={DocViewer}
        />

        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </BrowserRouter>
  );
}
