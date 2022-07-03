module.exports = {
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["<rootDir>"],
      exclude: ["**/node_modules/**"],
    },
  ],
  format: "po",
}
