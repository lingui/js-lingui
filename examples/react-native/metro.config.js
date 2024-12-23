// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("@lingui/metro-transformer/expo"),
};
config.resolver = {
  ...resolver,
  sourceExts: [...resolver.sourceExts, "po", "pot"],
};

module.exports = config;
