module.exports = {
  locales: ["en", "cs"],
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"]
    }
  ],
  format: "po",
  sourceLocale: "en"
}
