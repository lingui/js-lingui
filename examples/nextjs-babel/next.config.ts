import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
    rules: {
      '*.po': {
        loaders: ['@lingui/loader'],
        as: '*.js',
      },
    },
  },
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en", "cs", "pseudo"],
    defaultLocale: "en",
  },
}

export default nextConfig
