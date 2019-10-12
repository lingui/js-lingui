module.exports = {
  locales: ["en", "cs"],
  format: "po",
  catalogs: [
    {
      path: "./src/locale/{locale}/messages",
      include: ["./src"]
    }
  ],
  sourceLocale: "en"
}
