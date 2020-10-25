***********************************************
API Reference - Webpack Loader (@lingui/loader)
***********************************************

It's a good practice to use compiled message catalogs during development. However,
running :cli:`compile` everytime messages are changed soon becomes tedious.

``@lingui/loader`` is a webpack loader, which compiles messages on the fly:

Installation
============

Install ``@lingui/loader`` as a development dependency:

.. code-block:: sh

   npm install --save-dev @lingui/loader

   # Or using yarn
   # yarn add --dev @lingui/loader

Usage
=====

Simply prepend ``@lingui/loader:`` in front of path to message catalog you want to
import. Here's an example of dynamic import:

.. code-block:: jsx

   export async function dynamicActivate(locale: string) {
      const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.js`)
      i18n.load(locale, messages)
      i18n.activate(locale)
   }

See the `guide about dynamic loading catalogs <../guides/dynamic-loading-catalogs.html>`_
for more info.
