import { formatter } from "@lingui/format-json"

export default {
  locales: ["en"],
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
  format: formatter({ style: "minimal" }),
}
