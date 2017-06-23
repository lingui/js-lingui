import babel from 'rollup-plugin-babel'

// rollup.config.js
export default {
  entry: 'src/index.js',
  dest: 'lib/index.js',
  format: 'cjs',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  external: [
    'react',
    'prop-types'
  ]
}
