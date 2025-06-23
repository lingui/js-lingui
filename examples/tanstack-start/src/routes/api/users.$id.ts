import { json } from "@tanstack/react-start"
import axios from "redaxios"
import type { User } from "../../utils/users"
import { createServerFileRoute } from "@tanstack/react-start/server"
import { linguiMiddleware } from "~/modules/lingui/lingui-middleware"
import { msg } from "@lingui/core/macro"

export const ServerRoute = createServerFileRoute("/api/users/$id").methods(
  (api) => ({
    GET: api
      .middleware([linguiMiddleware])
      .handler(async ({ request, params, context }) => {
        console.info(`Fetching users by id=${params.id}... @`, request.url)

        try {
          const res = await axios.get<User>(
            "https://jsonplaceholder.typicode.com/users/" + params.id,
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
            { status: 404 },
          )
        }
      }),
  }),
)
