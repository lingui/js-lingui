module.exports = {
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: ["<rootDir>/pages"],
      ignore: []
    }
  ]
}
