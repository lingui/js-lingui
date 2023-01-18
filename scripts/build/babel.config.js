// Babel builder doesn't generate CommonJS, but ES modules.
// Rollup, however, needs `modules: false, babel modules: true`
module.exports = function(commonJs) {
  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          node: 14,
          browsers: "> 1%, last 2 versions, not dead"
        },
        modules: commonJs === false ? false : "commonjs"
      }
    ],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ]

  const plugins = [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-transform-runtime"
  ]

  return {
    presets,
    plugins
  }
}
