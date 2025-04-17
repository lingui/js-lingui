// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const { resolver } = config;

config.transformer.babelTransformerPath = require.resolve("@lingui/metro-transformer/expo");
config.resolver.sourceExts = [...resolver.sourceExts, "po", "pot"]
// unstable_enablePackageExports is true by default in React Native 0.79.0 and above
config.resolver.unstable_enablePackageExports = true
config.resolver.resolveRequest = (context, moduleImport, platform) => {
  switch (moduleImport) {
    case '@lingui/react':
      return { type: 'sourceFile', filePath: require.resolve('@lingui/react') };

    default:
      return context.resolveRequest(context, moduleImport, platform);
  }
};

module.exports = config;
