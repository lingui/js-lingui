/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "cs"],
  
  catalogs: [
    {
      path: "./src/locale/{locale}/messages",
      include: ["./src"],
    },
  ],
  sourceLocale: "en",
}
