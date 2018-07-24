**********
Typescript
**********

Typescript support is in progress. Please follow `typescript label <https://github.com/lingui/js-lingui/issues?q=is%3Aopen+is%3Aissue+label%3A%22env%3A+typescript%22>`_
in GitHub to see latest status.

Webpack setup
=============
The ability of lingui to support the intuitive syntax comes from the ``@lingui/babel-preset-react`` Babel transformation. The preset consist of 2 plugins, namely ``@lingui/babel-plugin-transform-js`` and ``@lingui/babel-plugin-transform-react``. The plugins perform transformation only on the JSX and tagged template literals. Thus, the JSX and tagged template literals *must not* be transpiled before the 2 plugins get to do their magic to process the intuitive syntax.

In order to preserve JSX and tagged template literals for the lingui plugins, you must set the following in your ``tsconfig.json``.

.. code:: js

  {
    "compilerOptions": {
      "jsx": "preserve",
      "target": "es2016"
    }
  }

For lingui 2.0+, install ``babel-loader``, ``babel-preset-react``, ``babel-preset-env``, ``@lingui/babel-preset-react``. Use the presets by changing your ``.babelrc`` to the following. The order of the preset is important.

.. code:: js

  {
    "presets": [
      "babel-preset-env",
      "babel-preset-react",
      "@lingui/babel-preset-react"
    ]
  }

In your ``webpack.config.js``, use both ``babel-loader`` and ``ts-loader`` for Typescript files.

.. code:: js

  {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'ts-loader']
        }
      ]
    }
  }

Type definitions
================

`Jeow Li Huan <https://github.com/huan086>`_ wrote type definition for ``@lingui/core``
and ``@lingui/react``:

The type definitions requires Typescript 2.8 or later.

.. code-block:: shell

   npm install --save-dev @types/lingui__core  # types for @lingui/core
   npm install --save-dev @types/lingui__react  # types for @lingui/react

Please report any issues in `maintainers repo <https://github.com/huan086/lingui-typings>`_.
