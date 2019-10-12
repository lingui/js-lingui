module.exports = {
  locales: ["en", "cs"],
  sourceLocale: "en",
  format: "po",
  catalogs: [
    {
      path: "./src/locales/{locale}",
      include: ["./src"]
    }
  ]
}
