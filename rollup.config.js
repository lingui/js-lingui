import babel from 'rollup-plugin-babel'

// rollup.config.js
export default {
  entry: 'src/index.js',
  targets: [{
    dest: 'lib/index.js',
    format: 'cjs'
  }, {
    dest: 'lib/index.es.js',
    format: 'es6'
  }],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
      runtimeHelpers: true
    })
  ],
  external: [
    'react',
    'prop-types'
  ]
}
