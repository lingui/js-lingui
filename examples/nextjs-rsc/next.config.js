/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.po/,
      use: [
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
