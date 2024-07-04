import { pick } from "accept-language-parser";
import { getClientLocales } from "./utils";
import { Cookie, SessionStorage } from "@remix-run/node";

export interface LanguageDetectorOption {
  /**
   * Define the list of supported languages, this is used to determine if one of
   * the languages requested by the user is supported by the application.
   * This should be be same as the supportedLngs in the i18next options.
   */
  supportedLanguages: string[];
  /**
   * Define the fallback language that it's going to be used in the case user
   * expected language is not supported.
   * This should be be same as the fallbackLng in the i18next options.
   */
  fallbackLanguage: string;
  /**
   * If you want to use a cookie to store the user preferred language, you can
   * pass the Cookie object here.
   */
  cookie?: Cookie;
  /**
   * If you want to use a session to store the user preferred language, you can
   * pass the SessionStorage object here.
   * When this is not defined, getting the locale will ignore the session.
   */
  sessionStorage?: SessionStorage;
  /**
   * If defined a sessionStorage and want to change the default key used to
   * store the user preferred language, you can pass the key here.
   * @default "lng"
   */
  sessionKey?: string;
  /**
   * If you want to use search parameters for language detection and want to
   * change the default key used to for the parameter name,
   * you can pass the key here.
   * @default "lng"
   */
  searchParamKey?: string;
  /**
   * The order the library will use to detect the user preferred language.
   * By default the order is
   * - searchParams
   * - cookie
   * - session
   * - header
   * And finally the fallback language.
   */
  order?: Array<"searchParams" | "cookie" | "session" | "header">;
}

export interface RemixLinguiOptions {
  detection: LanguageDetectorOption;
}

export class RemixLingui {
  private detector: LanguageDetector;

  constructor(private options: RemixLinguiOptions) {
    this.detector = new LanguageDetector(this.options.detection);
  }

  /**
   * Detect the current locale by following the order defined in the
   * `detection.order` option.
   * By default the order is
   * - searchParams
   * - cookie
   * - session
   * - header
   * And finally the fallback language.
   */
  public async getLocale(request: Request): Promise<string> {
    return this.detector.detect(request);
  }
}

/**
 * The LanguageDetector contains the logic to detect the user preferred language
 * fully server-side by using a SessionStorage, Cookie, URLSearchParams, or
 * Headers.
 */
export class LanguageDetector {
  constructor(private options: LanguageDetectorOption) {
    this.isSessionOnly(options);
    this.isCookieOnly(options);
  }

  private isSessionOnly(options: LanguageDetectorOption) {
    if (
      options.order?.length === 1 &&
      options.order[0] === "session" &&
      !options.sessionStorage
    ) {
      throw new Error(
        "You need a sessionStorage if you want to only get the locale from the session",
      );
    }
  }

  private isCookieOnly(options: LanguageDetectorOption) {
    if (
      options.order?.length === 1 &&
      options.order[0] === "cookie" &&
      !options.cookie
    ) {
      throw new Error(
        "You need a cookie if you want to only get the locale from the cookie",
      );
    }
  }

  public async detect(request: Request): Promise<string> {
    const order = this.options.order ?? [
      "searchParams",
      "cookie",
      "session",
      "header",
    ];

    for (const method of order) {
      let locale: string | null = null;

      if (method === "searchParams") {
        locale = this.fromSearchParams(request);
      }

      if (method === "cookie") {
        locale = await this.fromCookie(request);
      }

      if (method === "session") {
        locale = await this.fromSessionStorage(request);
      }

      if (method === "header") {
        locale = this.fromHeader(request);
      }

      if (locale) return locale;
    }

    return this.options.fallbackLanguage;
  }

  private fromSearchParams(request: Request): string | null {
    const url = new URL(request.url);
    if (!url.searchParams.has(this.options.searchParamKey ?? "lng")) {
      return null;
    }
    return this.fromSupported(
      url.searchParams.get(this.options.searchParamKey ?? "lng"),
    );
  }

  private async fromCookie(request: Request): Promise<string | null> {
    if (!this.options.cookie) return null;

    const cookie = this.options.cookie;
    const lng = await cookie.parse(request.headers.get("Cookie"));

    if (typeof lng !== "string" || !lng) return null;

    return this.fromSupported(lng);
  }

  private async fromSessionStorage(request: Request): Promise<string | null> {
    if (!this.options.sessionStorage) return null;

    const session = await this.options.sessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    const lng = session.get(this.options.sessionKey ?? "lng");

    if (!lng) return null;

    return this.fromSupported(lng);
  }

  private fromHeader(request: Request): string | null {
    const locales = getClientLocales(request);

    if (!locales) return null;

    if (Array.isArray(locales)) return this.fromSupported(locales.join(","));

    return this.fromSupported(locales);
  }

  private fromSupported(language: string | null) {
    return (
      pick(
        this.options.supportedLanguages,
        language ?? this.options.fallbackLanguage,
        { loose: false },
      ) ||
      pick(
        this.options.supportedLanguages,
        language ?? this.options.fallbackLanguage,
        { loose: true },
      )
    );
  }
}
