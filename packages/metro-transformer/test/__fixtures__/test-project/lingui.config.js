module.exports = {
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "locales/{locale}/messages",
      include: ["src"],
    },
  ],
  fallbackLocales: {
    cs: "en",
  },
}
