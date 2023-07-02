### Lingui React Native Demo App

This example app accompanies the tutorial https://lingui.dev/tutorials/react-native.

It can also be used to test out changes made in `@lingui/core` and `@lingui/react` using these steps:

Note the following instructions can be expanded for any package inside the `packages` folder.

For a diff of the necessary changes, see [this commit](https://github.com/lingui/js-lingui/pull/1714/commits/51422cbac57010d3de71c24b0cfa7bd02e9bf7f1).

1. run `yarn install` in the app directory.
2. change the `metro.config.js` like so:

```js
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
const linguiReactPackage = path.resolve(projectRoot, "../../packages/react");
const linguiCorePackage = path.resolve(projectRoot, "../../packages/core");

module.exports = (() => {
  const defaultConfig = getDefaultConfig(projectRoot);

  const config = {
    ...defaultConfig,
    projectRoot,
    watchFolders: [linguiReactPackage, linguiCorePackage, workspaceNodeModules],
  };
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    workspaceNodeModules,
  ];
  config.resolver.blockList = blockList;
  return config;
})();
```
3. add `"react-native": "./src/index.ts"` entries to `package.json` files inside `@lingui/core` and `@lingui/react`.
4. run the app on iOS or Android.

Then modify TS files in `@lingui/core` or `@lingui/react` in the `packages` folder and observe the changes right away.
