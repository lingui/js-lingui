import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { i18n } from "@lingui/core";
import { I18nProvider } from '@lingui/react'
import { defaultLocale, dynamicActivate } from './i18n';

const I18nApp = () => {
  useEffect(() => {
    // With this method we dynamically load the catalogs
    dynamicActivate(defaultLocale)
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <App  />
    </I18nProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <I18nApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
