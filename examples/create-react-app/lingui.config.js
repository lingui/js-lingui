module.exports = {
  locales: ["en", "cs"],
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
    },
  ],
  format: "minimal",
  sourceLocale: "en",
}
