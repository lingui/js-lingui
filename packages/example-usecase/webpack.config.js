const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './bundle.js',
    path: path.resolve('public')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.IgnorePlugin(/\.dev$/, /lingui-i18n/)
  ],

  devServer: {
    hot: true,
    inline: true,
    contentBase: path.resolve('public')
  }
}
