import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"
import { serialize } from "cookie-es"

export const updateLocale = createServerFn({ method: "POST" })
  .inputValidator((locale: string) => locale)
  .handler(async ({ data }) => {
    setResponseHeader(
      "Set-Cookie",
      serialize("locale", data, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      })
    )
  })
