import babel from 'rollup-plugin-babel'

const module = process.argv
  .filter(option => /^--module/.test(option))
  .map(option => option.replace('--module=', ''))[0] || ''

// rollup.config.js
export default {
  entry: `src/${module}/index.js`,
  targets: [{
    dest: `dist/${module}/index.js`,
    format: 'cjs'
  }, {
    dest: `dist/${module}/index.es.js`,
    format: 'es'
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
