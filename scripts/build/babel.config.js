// Babel builder doesn't generate CommonJS, but ES modules.
// Rollup, however, needs `modules: false, babel modules: true`
module.exports = function(options) {
  const config = {
    // Workaround for transform-runtime bug with export * from "./module"
    // https://github.com/babel/babel/issues/2877#issuecomment-245402025
    passPerPreset: true,
    presets: [
      { plugins: ["transform-runtime"] },
      {
        passPerPreset: false,
        presets: [
          "react",
          [
            "env",
            {
              targets: {
                node: 4,
                browsers: "> 1%, last 2 versions"
              },
              modules: options.modules === false ? false : "commonjs"
            }
          ]
        ]
      }
    ],
    plugins: [
      ["transform-class-properties", { loose: false }],
      "transform-export-default",
      "transform-object-rest-spread",
      "transform-runtime"
    ]
  }

  if (process.env.NODE_ENV === "test") {
    config.plugins.push("transform-es2015-modules-commonjs")
  }

  return config
}
