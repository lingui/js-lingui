module.exports = function (api) {
  api.cache(false);
  return {
    plugins: ["@lingui/babel-plugin-lingui-macro"],
    presets: ["babel-preset-expo"],
  };
};
