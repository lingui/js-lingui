import { json } from "@tanstack/react-start"
import axios from "redaxios"
import type { User } from "~/utils/users"
import { createFileRoute } from "@tanstack/react-router"
import { msg } from "@lingui/core/macro"
import { linguiMiddleware } from "~/modules/lingui/lingui-middleware"

export const Route = createFileRoute("/api/users/$id")({
  server: {
    middleware: [linguiMiddleware],
    handlers: {
      GET: async ({ request, params, context }) => {
        console.info(`Fetching users by id=${params.id}... @`, request.url)
        try {
          const res = await axios.get<User>(
            "https://jsonplaceholder.typicode.com/users/" + params.id
          )

          return json({
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
          })
        } catch (e) {
          console.error(e)
          return json(
            { error: context.i18n._(msg`User not found`) },
            { status: 404 }
          )
        }
      },
    },
  },
})
