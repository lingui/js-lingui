/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.po/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@lingui/loader',
        },
      ],
    })
    return config
  },
  experimental: {
    swcPlugins: [
      ['@lingui/swc-plugin', {}],
    ],
  },
}
