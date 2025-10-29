import { createMiddleware } from "@tanstack/react-start"
import { getLocaleFromRequest } from "~/modules/lingui/i18n.server"
import { dynamicActivate, initI18n } from "~/modules/lingui/i18n"

export const linguiMiddleware = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const { locale, headers } = getLocaleFromRequest(request)

    const i18n = initI18n()
    await dynamicActivate(i18n, locale)

    const result = await next({
			context: {
				locale,
				i18n,
			},
		});

		if (headers) {
			headers.forEach(({ key, value }) => {
				result.response.headers.append(key, value);
			});
		}

		return result;
  }
)
