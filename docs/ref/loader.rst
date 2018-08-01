***********************************************
API Reference - Webpack Loader (@lingui/loader)
***********************************************

It's a good practice to use compiled message catalogs during development. However,
running :cli:`compile` everytime messages are changed soon becomes tedious.

``@lingui/loader`` is a webpack loader, which compiles messages on the fly:

Installation
============

Install ``@lingui/loader`` as a development dependency:

   npm install --save-dev @lingui/loader
   # yarn add --dev @lingui/loader

Usage
=====

Simply prepend ``@lingui/loader:`` in front of path to message catalog you want to
import. Here's an example of dynamic import:

.. code-block:: jsx

   class I18nLoader extends React.Component {
      loadMessages = (language) => {
         return await import(`@lingui/loader:./locale/${language}/messages.js`)
      }

      render() {
         // ...
      }
   }

See the `guide about dynamic loading catalogs <../guides/dynamic-loading-catalogs>`_
for more info.
