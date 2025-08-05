import { createMiddleware } from "@tanstack/react-start"
import { getLocaleFromRequest } from "~/modules/lingui/i18n.server"
import { setupI18n } from "@lingui/core"
import { dynamicActivate } from "~/modules/lingui/i18n"

export const linguiMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const locale = getLocaleFromRequest()

    const i18n = setupI18n({})

    await dynamicActivate(i18n, locale)

    return next({
      context: { i18n },
    })
  }
)
