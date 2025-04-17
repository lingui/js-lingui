// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const { resolver } = config;

config.transformer.babelTransformerPath = require.resolve("@lingui/metro-transformer/expo");
config.resolver.sourceExts = [...resolver.sourceExts, "po", "pot"]
config.resolver.unstable_enablePackageExports = true

module.exports = config;
