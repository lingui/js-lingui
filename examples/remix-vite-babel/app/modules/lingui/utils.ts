import { parseAcceptLanguage } from "intl-parse-accept-language";

export type Locales = string | string[] | undefined;

/**
 * Get the client's locales from the Accept-Language header.
 * If the header is not defined returns null.
 * If the header is defined return an array of locales, sorted by the quality
 * value.
 *
 * @example
 * export let loader: LoaderFunction = async ({ request }) => {
 *   let locales = getClientLocales(request)
 *   let date = new Date().toLocaleDateString(locales, {
 *     "day": "numeric",
 *   });
 *   return json({ date })
 * }
 */
export function getClientLocales(headers: Headers): Locales;
export function getClientLocales(request: Request): Locales;
export function getClientLocales(requestOrHeaders: Request | Headers): Locales {
  const headers = getHeaders(requestOrHeaders);

  const acceptLanguage = headers.get("Accept-Language");

  // if the header is not defined, return undefined
  if (!acceptLanguage) return undefined;

  const locales = parseAcceptLanguage(acceptLanguage, {
    validate: Intl.DateTimeFormat.supportedLocalesOf,
    ignoreWildcard: true,
  });

  // if there are no locales found, return undefined
  if (locales.length === 0) return undefined;
  // if there is only one locale, return it
  if (locales.length === 1) return locales[0];
  // if there are multiple locales, return the array
  return locales;
}

/**
 * Receives a Request or Headers objects.
 * If it's a Request returns the request.headers
 * If it's a Headers returns the object directly.
 */
function getHeaders(requestOrHeaders: Request | Headers): Headers {
  if (requestOrHeaders instanceof Request) {
    return requestOrHeaders.headers;
  }

  return requestOrHeaders;
}
