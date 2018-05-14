// Babel builder doesn't generate CommonJS, but ES modules.
// Rollup, however, needs `modules: false, babel modules: true`
module.exports = function(options) {
  return {
    presets: [
      "@babel/preset-react",
      "@babel/preset-flow",
      [
        "@babel/preset-env",
        {
          targets: {
            node: 4,
            browsers: "> 1%, last 2 versions"
          },
          modules: options.modules === false ? false : "commonjs"
        }
      ]
    ],
    plugins: [
      ["@babel/plugin-proposal-class-properties", { loose: false }],
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/transform-runtime"
    ],
    env: {
      test: {
        plugins: ["@babel/transform-modules-commonjs"]
      }
    }
  }
}
