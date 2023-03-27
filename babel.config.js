module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: 16,
        },
        modules: "commonjs",
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
}
