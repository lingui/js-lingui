import { createServerFn } from "@tanstack/react-start"
import { setHeader } from "@tanstack/react-start/server"
import { serialize } from "cookie-es"

export const updateLocale = createServerFn({ method: "POST" })
  .validator((locale: string) => locale)
  .handler(async ({ data }) => {
    setHeader(
      "Set-Cookie",
      serialize("locale", data, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      })
    )
  })
