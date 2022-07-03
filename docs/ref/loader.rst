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

.. important::

   If you use Create React App version 5, the following simple use of ``@lingui/loader``
   does not work due to the default webpack config of Create React App.

   Please see the :ref:`next section<cra-5>` for a workaround.

Simply prepend ``@lingui/loader:`` in front of path to message catalog you want to
import. Here's an example of dynamic import:

Extension is mandatory. If you use minimal or lingui file format, use ``.json``. In case of using po format, use ``.po``.

.. code-block:: jsx

   export async function dynamicActivate(locale: string) {
      const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.json`)
      i18n.load(locale, messages)
      i18n.activate(locale)
   }

See the `guide about dynamic loading catalogs <../guides/dynamic-loading-catalogs.html>`_
for more info.

.. _cra-5:

Usage with create-react-app@5
====================

Starting with ``react-scripts@5``, Create React App configures all unknown file extensions to be
of type ``asset/resource``. This makes it possible for you to import a file of any type and get
webpack's virtual filename, e.g. to set the ``src`` attribute of a ``<video>`` element.
This configuration, however, makes it impossible to properly load ``.po`` files using
``@lingui/loader`` like above.

As a workaround, if you use ``react-scripts@5``, you have to use the following syntax to use
``@lingui/loader``:

.. code-block:: jsx

   async function importMessages(locale: string) {
     /* eslint-disable import/no-webpack-loader-syntax */
     switch (locale) {
       case "cs":
         // @ts-ignore
         return await import("messages.js!=!@lingui/loader!./locales/cs/messages.po")
       case "en":
       default:
         // @ts-ignore
         return await import("messages.js!=!@lingui/loader!./locales/en/messages.po")
     }
     /* eslint-enable */
   }

   export async function dynamicActivate(locale: string) {
     const { messages } = await importMessages(locale)
     i18n.load(locale, messages)
     i18n.activate(locale)
   }

.. note::

   Due to a limitation in the dynamic import syntax together with inline resource syntax,
   you have to specify every language import explicitly in the ``switch/case`` statement
   instead of using a template string.