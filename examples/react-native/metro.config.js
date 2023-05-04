// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver } = config;

  config.resolver = {
    ...resolver,
    // NOTE: in future, this will be enabled by default
    unstable_enablePackageExports: true,
  };

  return config;
})();
