// Babel builder doesn't generate CommonJS, but ES modules.
// Rollup, however, needs `modules: false, babel modules: true`
module.exports = function(options) {
  const presets = [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        targets: {
          node: 8,
          browsers: "> 1%, last 2 versions"
        },
        modules: options.modules === false ? false : "commonjs"
      }
    ],
    "@babel/preset-react",
    "@babel/preset-flow"
  ]

  const plugins = [
    ["@babel/plugin-proposal-class-properties", { loose: false }],
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-transform-runtime"
  ]

  if (process.env.NODE_ENV === "test") {
    plugins.push("@babel/plugin-transform-modules-commonjs")
  }

  return {
    presets,
    plugins
  }
}
