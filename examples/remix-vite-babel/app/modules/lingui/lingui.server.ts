import config from "./config";
import { RemixLingui } from "./remix.server";
import { createCookie } from "@remix-run/node";

export const localeCookie = createCookie("lng", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
});

const fallbackLocale = config.fallbackLocales && config.fallbackLocales.default;

export const linguiServer = new RemixLingui({
  detection: {
    supportedLanguages: config.locales,
    fallbackLanguage:
      typeof fallbackLocale === "string" ? fallbackLocale : "en",
    cookie: localeCookie,
  },
});
