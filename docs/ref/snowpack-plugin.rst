*********************************************************
API Reference - Snowpack Plugin (@lingui/snowpack-plugin)
*********************************************************

It's a good practice to use compiled message catalogs during development. However,
running :cli:`compile` everytime messages are changed soon becomes tedious.

``@lingui/snowpack-plugin`` is a Snowpack plugin, which compiles messages on the fly:

Installation
============

Install ``@lingui/snowpack-plugin`` as a development dependency:

.. code-block:: sh

   npm install --save-dev @lingui/snowpack-plugin

   # Or using yarn
   # yarn add --dev @lingui/snowpack-plugin

Usage
=====

Simply add ``@lingui/snowpack-plugin`` inside your ``snowpack.config.js``:

.. code-block:: js

   module.exports = {
      plugins: [
         '@lingui/snowpack-plugin',
      ],
   }

Then in your code all you need is to use `dynamic imports <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports>`_ to load only necessary catalog. Extension is mandatory. In case of using po format, use ``.po``.

.. code-block:: ts

   export async function dynamicActivate(locale: string) {
      let catalog: {messages: Messages}
      
      switch (locale) {
        case 'cs':
          catalog = await import('./locales/cs/messages.po')
          break
        case 'en':
        default:
          catalog = await import('./locales/en/messages.po')
          break;
      }
      
      i18n.load(locale, catalog.messages)
      i18n.activate(locale)
   }

.. note::
   Comparing to `Webpack instructions for dynamic loading <./loader.html>`_, code snippet above doesn't rely on variable ``locale`` to do the actual import. Instead, we manually check every possible value using ``switch/case`` and import final catalog by exact path. This is default behavior (or restriction?) of `esbuild <https://esbuild.github.io>`_ - *extremely fast JavaScript bundler* used by Snowpack under the hood. There is `an issue regarding this feature <https://github.com/evanw/esbuild/issues/700>`_
   Similar restrictions apply to Babel macros or other non-standard features - they won't work with ``esbuild``

See the `guide about dynamic loading catalogs <../guides/dynamic-loading-catalogs.html>`_
for more info.
