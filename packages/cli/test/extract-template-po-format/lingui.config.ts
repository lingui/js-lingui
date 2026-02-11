export default {
  locales: ["en", "pl"],
  sourceLocale: "en",

  catalogs: [
    {
      path: "<rootDir>/actual/{locale}",
      include: ["<rootDir>/fixtures"],
    },
  ],
}
