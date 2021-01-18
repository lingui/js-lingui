***********************************************
API Reference - Snowpack Loader (@lingui/snowpack-loader)
***********************************************

It's a good practice to use compiled message catalogs during development. However,
running :cli:`compile` everytime messages are changed soon becomes tedious.

``@lingui/snowpack-loader`` is a snowpack loader, which compiles messages on the fly:

Installation
============

Install ``@lingui/snowpack-loader`` as a development dependency:

.. code-block:: sh

   npm install --save-dev @lingui/snowpack-loader

   # Or using yarn
   # yarn add --dev @lingui/snowpack-loader

Usage
=====

Simply add ``@lingui/snowpack-loader`` inside your ``snowpack.config.js``:

.. code-block:: js

   module.exports = {
      plugins: [
         '@lingui/snowpack-loader',
      ],
   }

Then in your code all you need is to use dynamic() import. Extension is mandatory. In case of using po format, use ``.po``.

.. code-block:: jsx

   export async function dynamicActivate(locale: string) {
      const { messages } = await import(`./locales/${locale}/messages.po`)
      i18n.load(locale, messages)
      i18n.activate(locale)
   }

See the `guide about dynamic loading catalogs <../guides/dynamic-loading-catalogs.html>`_
for more info.
