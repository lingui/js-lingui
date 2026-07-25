import type { NextConfig } from 'next'
import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options'

const nextConfig: NextConfig = {
  experimental: {
    swcPlugins: [linguiMacroSwcPlugin()],
    turbo: {
      rules: {
        '*.po': {
          loaders: ['@lingui/loader'],
          as: '*.js'
        }
      }
    }
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: "@lingui/loader",
      },
    });

    return config;
  },
}

export default nextConfig
