import babel from 'rollup-plugin-babel'

const module = process.argv
  .filter(option => /^--module/.test(option))
  .map(option => option.replace('--module=', ''))[0] || ''

// rollup.config.js
export default {
  input: `src/${module}/index.js`,
  output: [{
    file: `dist/${module}/index.js`,
    format: 'cjs'
  }, {
    file: `dist/${module}/index.es.js`,
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
