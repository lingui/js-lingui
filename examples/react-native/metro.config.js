// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const { resolver } = config;

config.transformer.babelTransformerPath = require.resolve("@lingui/metro-transformer/expo");
config.resolver.sourceExts = [...resolver.sourceExts, "po", "pot"]

// unstable_enablePackageExports is true by default in React Native 0.79.0 and above
// If you run into https://github.com/lingui/js-lingui/issues/2231, you can specify custom `resolveRequest` as shown below,
// or disable unstable_enablePackageExports
config.resolver.unstable_enablePackageExports = true
config.resolver.resolveRequest = (context, moduleImport, platform) => {
  switch (moduleImport) {
    case '@lingui/core':
    case '@lingui/react':
      return { type: 'sourceFile', filePath: require.resolve(moduleImport) };

    default:
      return context.resolveRequest(context, moduleImport, platform);
  }
};

module.exports = config;
