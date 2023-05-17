import { formatter } from "@lingui/format-json"

export default {
  locales: ["en"],
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
  fallbackLocales: {
    default: "en",
  },
  format: formatter({ style: "minimal" }),
}
