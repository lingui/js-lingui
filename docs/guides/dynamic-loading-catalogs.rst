.. _dynamic-loading-catalogs:

Jump to `final helper <dynamic-loading-catalogs.html#final-i18n-loader-helper>`_.

***********************************
Dynamic loading of message catalogs
***********************************

``I18nProvider`` doesn't assume anything about your app and it's your
responsibility to load messages based on active language. Here's an example of a basic setup
with a dynamic load of catalogs.

Setup
=====

.. warning::

   You don't have to install following Babel plugins if you're using Create React App
   or similar framework which already has it.

We are using the `Dynamic Import() Proposal <https://github.com/tc39/proposal-dynamic-import>`_
to ECMAScript. We need to install ``@babel/plugin-@babel/plugin-syntax-dynamic-import`` and
``babel-plugin-dynamic-import-node`` to make it work. Also, the code examples given here make use of ``@babel/plugin-proposal-class-properties``

.. code-block:: shell

   yarn add --dev @babel/plugin-syntax-dynamic-import babel-plugin-dynamic-import-node @babel/plugin-proposal-class-properties

.. warning::

   `babel-plugin-dynamic-import-node` is required when running tests in Jest.

.. code-block:: js

   // .babelrc
   {
     "plugins": [
       "@babel/plugin-syntax-dynamic-import",
       "@babel/plugin-proposal-class-properties"
     ],
     "env": {
       "test": {
         "plugins": [
           "dynamic-import-node"
         ]
       }
     }
   }

Final I18n loader helper
========================

Here's the full source of ``i18n.ts`` logic:

.. code-block:: jsx

  import { i18n } from '@lingui/core';
  import { en, cs } from 'make-plural/plurals'

  export const locales = {
    en: "English",
    cs: "Česky",
  };
  export const defaultLocale = "en";

  i18n.loadLocaleData({
    en: { plurals: en },
    cs: { plurals: cs },
  })

  /**
  * We do a dynamic import of just the catalog that we need
  * @param locale any locale string
  */
  export async function dynamicActivate(locale: string) {
    const { messages } = await import(`./locales/${locale}/messages`)
    i18n.load(locale, messages)
    i18n.activate(locale)
  }


**How should I use the dynamicActivate in our application?**

.. code-block:: jsx

  import React, { useEffect } from 'react';
  import App from './App';

  import { I18nProvider } from '@lingui/react';
  import { i18n } from '@lingui/core';
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


Conclusion
==========

Looking at the content of build dir, we see one chunk per language:

.. code-block:: shell

   i18n-0.c433b3bd.chunk.js
   i18n-1.f0cf2e3d.chunk.js
   main.ab4626ef.js

When page is loaded initially, only main bundle and bundle for the first
language are loaded:

.. image:: ./dynamic-loading-catalogs-1.png
   :alt: Requests during the first render

After changing language in UI, the second language bundle is loaded:

.. image:: ./dynamic-loading-catalogs-2.png
   :alt: Requests during the second render

And that's it! 🎉
