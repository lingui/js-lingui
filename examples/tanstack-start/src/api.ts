import {
  createStartAPIHandler,
  defaultAPIFileRouteHandler,
} from "@tanstack/react-start/api"
import {
  defaultLocale,
  dynamicActivate,
  isLocaleValid,
} from "./modules/lingui/i18n"

export default createStartAPIHandler(async (ctx) => {
  // Define the locale based on the Accept-Language header
  const headerLocale = ctx.request.headers.get("Accept-Language") ?? ""
  await dynamicActivate(
    isLocaleValid(headerLocale) ? headerLocale : defaultLocale
  )

  return defaultAPIFileRouteHandler(ctx)
})
