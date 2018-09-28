const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "./bundle.js",
    path: path.resolve("public")
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },

  devtool: "inline-source-map",
  devServer: {
    hot: true,
    inline: true,
    contentBase: path.resolve("public")
  }
}
