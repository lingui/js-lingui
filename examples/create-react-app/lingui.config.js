module.exports =  {
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [{
    path: "src/locales/{locale}/messages",
    include: ["src"]
  }],
  format: "po"
}