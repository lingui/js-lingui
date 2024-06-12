import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  fallbackLocales: {
    default: "en",
  },
  locales: ["en", "fr"],
  catalogs: [
    {
      path: "<rootDir>/app/locales/{locale}",
      include: ["app"],
    },
  ],
};

export default config;
