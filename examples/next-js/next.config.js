module.exports =  {
  webpack: (config, { isServer }) => {
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.po/,
        use: [
          {
            loader: "@lingui/loader",
          },
        ],
      },
    ];

    return config;
  },
  future: {
    webpack5: true,
  },
}