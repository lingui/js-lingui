Integration with boilerplates and zero-conf libraries
=====================================================

There're many boilerplates and zero-configuration libraries out there.
Unfortunatelly, most of them put hard-coded Babel configuration inside Webpack 
config. This sad decision makes project directory one file cleaner, but no 
external tool can extend such configuration.

It's possible to use **jsLingui** without any Babel plugins, but you still
need at least one for message extraction (`babel-plugin-lingui-extract-messages`).

`lingui-cli` sets up everything for you, but you need to place Babel config
in a [standard place](https://babeljs.io/docs/usage/babelrc/): either 
`.babelrc` file or `babel` section in `package.json`.

> This is the same problem what react-intl has. It affects any library, which
expects Babel configuration in a standard place

## Examples

### Create React App

Create React App at least has it's own preset, so all you need to do is create 
this Babel config in your root directory:

```json
{
  "presets": ["react-app"]
}
```

However, you can't add `lingui-preset` here neither. It will only work for
extracting messages.

### Neutrino

You need to change config of `neutrino-preset-react`:

```js
const path = require('path');

module.exports = {
  use: [
    ['neutrino-preset-react', {
      babel: {
        presets: [
          ['babel-preset-env', {
            targets: {
              browsers: [
                'last 1 Chrome versions',
                'last 1 Firefox versions'
              ]
            }
          }],
          'lingui-react' // add lingui preset here
        ]
      }
    }],
    'neutrino-webpack.js',
    'neutrino-sass.js',
    ...
  ]
}
```

### Any other boilerplate

If you're using a starter kit, i.e: files you copy into your project and manage
them on your own, take a look at webpack config, cut `query` section from
`babel-loader`:

```js
// Example from react-redux-starter-kit
// JavaScript
// ------------------------------------
config.module.rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [{
    loader: 'babel-loader',
    query: {
      cacheDirectory: true,
      plugins: [
        'babel-plugin-transform-class-properties',
        'babel-plugin-syntax-dynamic-import',
        [
          'babel-plugin-transform-runtime',
          {
            helpers: true,
            polyfill: false, // we polyfill needed features in src/normalize.js
            regenerator: true,
          },
        ],
        [
          'babel-plugin-transform-object-rest-spread',
          {
            useBuiltIns: true // we polyfill Object.assign in src/normalize.js
          },
        ],
      ],
      presets: [
        'babel-preset-react',
        ['babel-preset-env', {
          modules: false,
          targets: {
            ie9: true,
          },
          uglify: true,
        }],
      ]
    },
  }],
})
```

… and paste it in `.babelrc` in the root of your repository:

```json
{
  "plugins": [
    "babel-plugin-transform-class-properties",
    "babel-plugin-syntax-dynamic-import",
    [
      "babel-plugin-transform-runtime",
      {
        "helpers": true,
        "polyfill": false,
        "regenerator": true,
      }
    ], [
      "babel-plugin-transform-object-rest-spread",
      {
        "useBuiltIns": true
      }
    ]
  ],
  "presets": [
    "babel-preset-react",
    ["babel-preset-env", {
      "modules": false,
      "targets": {
        "ie9": true
      },
      "uglify": true
    }],
    "lingui-react"  // add lingui preset here
  ]
}
```

## What's next

All guides above are just temporary workarounds, but as long as boilerplates 
don't allow any customization, there's very little to do. However, there's a 
ongoing discussion about `babel-macros`, which looks promising. Fingers crossed.
