/** @type {import('next').NextConfig} */
module.exports = {
  // i18n: {
  // this option has been replaced by the middleware in src/
  // when migrating to support app router
  // },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader'
      }
    })
    return config
  },
  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]]
  }
}
