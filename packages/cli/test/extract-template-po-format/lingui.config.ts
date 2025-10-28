export default {
  locales: ["en", "pl"],
  sourceLocale: "en",
  format: "po",
  catalogs: [
    {
      path: "<rootDir>/actual/{locale}",
      include: ["<rootDir>/fixtures"],
    },
  ],
}
