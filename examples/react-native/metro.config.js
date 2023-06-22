// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");
const escape = require("escape-string-regexp");

const path = require("path");

const projectRoot = __dirname;
const workspaceNodeModules = path.resolve(projectRoot, "../../node_modules");

const blockList = exclusionList([
  // use these dependencies from workspaceNodeModules, not from the example's node_modules
  new RegExp(`^${escape(path.join(projectRoot, "node_modules", "react"))}\\/.*$`),
  new RegExp(`^${escape(path.join(projectRoot, "node_modules", "@lingui/core"))}\\/.*$`),
]);

module.exports = (() => {
  const defaultConfig = getDefaultConfig(projectRoot);

  const reactPackage = path.resolve(projectRoot, "../../packages/react");
  const corePackage = path.resolve(projectRoot, "../../packages/core");
  const config = {
    ...defaultConfig,
    projectRoot,
    watchFolders: [reactPackage, corePackage, workspaceNodeModules],
  };
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    workspaceNodeModules,
  ];
  config.resolver.blockList = blockList;
  return config;
})();
