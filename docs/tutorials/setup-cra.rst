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

      npm install --save-dev @lingui/cli @lingui/macro @babel/core babel-core@bridge
      npm install --save @lingui/react

      # or using Yarn
      yarn add --dev @lingui/cli @lingui/macro @babel/core babel-core@bridge
      yarn add @lingui/react

   .. important::

      Don't forget Babel packages (``@babel/core``, ``babel-core@bridge``) which are
      required for backward compatibility with projects using Babel 6.

3. Create ``.linguirc`` file with LinguiJS configuration in root of your project (next
   to ``package.json``):

   .. code-block:: json

      {
         "localeDir": "src/locales/",
         "srcPathDirs": ["src/"],
         "format": "po",
         "sourceLocale": "en"
      }

   This configuration will extract messages from source files inside ``src`` directory
   and write them into message catalogs in ``src/locales`` (English catalog would be
   in e.g: ``src/locales/en/messages.po``). Finally, PO format is recommended. See
   :conf:`format` documentation for other available formats.

4. Add following scripts to your ``package.json``:

   .. code-block:: json

      {
         "scripts": {
            "add-locale": "lingui add-locale",
            "extract": "lingui extract",
            "compile": "lingui compile",
         }
      }

5. Run ``npm run add-locale`` (or ``yarn add-locale``) with
   `locale codes <https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry>`_
   you would like to use in your app:

   .. code-block:: shell

      npm run add-locale en es fr  # Add English, Spanish and French locale

      # or using Yarn
      yarn add-locale en es fr

6. Check the installation by running ``npm run extract`` (or ``yarn extract``):

   .. code-block:: shell

      npm run extract

      # or using Yarn
      yarn extract

   There should be no error and you should see output similar following:

   .. code-block:: none

      > npm run extract

      Catalog statistics:
      ┌──────────┬─────────────┬─────────┐
      │ Language │ Total count │ Missing │
      ├──────────┼─────────────┼─────────┤
      │ cs       │     0       │   0     │
      │ en       │     0       │   0     │
      │ fr       │     0       │   0     │
      └──────────┴─────────────┴─────────┘

      (use "lingui add-locale <language>" to add more locales)
      (use "lingui extract" to update catalogs with new messages)
      (use "lingui compile" to compile catalogs for production)

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

Troubleshooting
===============

Cannot find module 'babel-core'
-------------------------------

   1. Check that you installed ``babel-core@bridge`` and ``@babel/core`` (step 2)
   2. Check that you use local version of ``@lingui/cli``. Installing ``@lingui/cli``
      globally may clash with other packages which use Babel 6. You should run
      either ``npm run extract`` or ``yarn extract`` (step 5).

.. _Create React App: https://github.com/facebook/create-react-app
