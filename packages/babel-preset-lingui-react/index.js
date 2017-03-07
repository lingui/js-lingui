module.exports = {
  plugins: [
    require('babel-plugin-lingui-transform-js').default,
    require('babel-plugin-lingui-transform-react').default,
    require('babel-plugin-lingui-extract-messages').default
  ]
}
