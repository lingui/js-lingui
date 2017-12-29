const config = {
  presets: [
    [
      "env",
      {
        modules: false
      }
    ],
    "react",
    "lingui-react"
  ],
  plugins: [
    "syntax-dynamic-import",
    "transform-class-properties",
    "transform-object-rest-spread"
  ]
}

const testConfig = Object.assign({}, config, {
  presets: [
    ["env", { modules: false }],
    require.resolve("../../build/packages/lingui-react")
  ]
})

module.exports = process.env.NODE_ENV === "test" ? testConfig : config
