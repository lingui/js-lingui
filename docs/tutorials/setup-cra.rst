===========================
Setup with Create React App
===========================

`Create React App`_ is a framework for writing React apps with no build configuration.
This guide suppose you use Create React App 2.0 (the default version).

Install
=======

1. Follow `Create React App`_ documentation for more info. Boostrap your project with
   following commands:

   .. code-block:: shell

      npx create-react-app my-app
      cd my-app

2. Install ``@lingui/cli``, ``@lingui/macro`` and Babel core packages as a development
   dependencies and ``@lingui/react`` as a runtime dependency.

   .. code-block:: shell

      npm install --save-dev @lingui/cli @lingui/macro @babel/core
      npm install --save @lingui/react

      # or using Yarn
      yarn add --dev @lingui/cli @lingui/macro @babel/core
      yarn add @lingui/react

3. Create ``.linguirc`` file with LinguiJS configuration in root of your project (next
   to ``package.json``):

   .. code-block:: json

      {
         "locales": ["en", "cs", "fr"],
         "sourceLocale": "en",
         "catalogs": [{
            "path": "src/locales/{locale}",
            "include": ["src"]
         }],
         "format": "po"
      }

   This configuration will extract messages from source files inside ``src`` directory
   and write them into message catalogs in ``src/locales`` (English catalog would be
   in e.g: ``src/locales/en.po``). Finally, PO format is recommended. See
   :conf:`format` documentation for other available formats.

4. Optionally, add following scripts to your ``package.json`` for conveniece:

   .. code-block:: json

      {
         "scripts": {
            "extract": "lingui extract",
            "compile": "lingui compile"
         }
      }

5. Check the installation by running extract command:

   .. code-block:: shell

      npm run extract

      # or using Yarn
      yarn extract

   There should be no error and you can find extracted messages in src/locales.

Congratulations! You've sucessfully set up project with LinguiJS.
Now it's good time to follow :doc:`React tutorial </tutorials/react>`
or read about :doc:`ICU Message Format </ref/message-format>` which
is used in messages.

Further reading
===============

Checkout these reference guides for full documentation:

- :doc:`ICU Message Format </ref/message-format>`
- :doc:`React reference </ref/macro>`
- :doc:`Macro reference </ref/react>`
- :doc:`CLI reference </ref/cli>`
- :doc:`Configuration reference </ref/conf>`

.. _Create React App: https://github.com/facebook/create-react-app
