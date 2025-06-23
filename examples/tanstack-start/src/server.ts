import { i18n, setupI18n } from "@lingui/core"
import {
  createStartHandler,
  defaultStreamHandler,
  requestHandler,
} from "@tanstack/react-start/server"
import { getLocaleFromRequest } from "~/modules/lingui/i18n.server"
import { createRouter } from "./router"
import { dynamicActivate } from "~/modules/lingui/i18n"

export default requestHandler(async (ctx) => {
  const locale = getLocaleFromRequest()
  const i18n = setupI18n({})

  await dynamicActivate(i18n, locale)

  const startHandler = createStartHandler({
    createRouter: () => {
      return createRouter({ i18n })
    },
  })

  return startHandler(defaultStreamHandler)(ctx)
})
