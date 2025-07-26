/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "de"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: ["<rootDir>/src"],
    },
  ],
}
