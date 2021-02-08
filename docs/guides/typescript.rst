**********
Typescript
**********

Lingui supports typescript types out of the box since version ``3.0.0``. Feel free to submit any query you find related to typescript on Github Issues

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

.. note::

   If you are not using `.babelrc` file, keep in mind that by running `lingui extract`, the Webpack config is not used. 
   To supply babel options for the extraction process use :conf:`extractBabelOptions` configuration option.


:conf:`compileNamespace` must be set to ``ts`` (ES6 default export) in the Lingui config
otherwise compiled catalogs can't be imported using ES ``import``, but rather CommonJS ``require``:

.. code:: js

  {
    "compileNamespace": "ts"
  }


Macros types in non-React environments
======================================

Since the opening of this issue we investigated that macros can be used on Typescript environments where React isn't required.

Now we're shipping two declaration types:
  - ``index.d.ts`` files with ``@lingui/core``, ``@lingui/react`` and ``react`` as peerDependencies.
  - ``global.d.ts`` files with just ``@lingui/core`` as peerDependencies.

Now you can modify your ``tsconfig.json`` in your root directory and reference the global file:

.. code-block:: json

  {
    "compilerOptions": {
      "types": [
        "./node_modules/@lingui/macro/global",
      ]
    }
  }


Type definitions
================

Since version ``3.0.0`` types are already inside ``@lingui`` modules, so you don't need to install any external dependency related to types.

**For earlier versions**:

`Jeow Li Huan <https://github.com/huan086>`_ wrote type definition for ``@lingui/core``
and ``@lingui/react``:

The type definitions requires Typescript 2.8 or later.

.. code-block:: shell

   npm install --save-dev @types/lingui__core  # types for @lingui/core
   npm install --save-dev @types/lingui__react  # types for @lingui/react
   npm install --save-dev @types/lingui__macro  # types for @lingui/macro

Please report any issues in `maintainers repo <https://github.com/huan086/lingui-typings>`_.
