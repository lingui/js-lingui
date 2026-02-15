import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"
import axios from "redaxios"
import type { User } from "~/utils/users"
import { DEPLOY_URL } from "~/utils/users"
import { NotFound } from "~/components/NotFound"
import { UserErrorComponent } from "~/components/UserError"
import { msg } from "@lingui/core/macro"

export const Route = createFileRoute("/users/$userId")({
  loader: async ({ params: { userId }, context }) => {
    return await axios
      .get<User>(DEPLOY_URL + "/api/users/" + userId, {
        headers: {
          "Accept-Language": context.i18n.locale,
        },
      })
      .then((r) => r.data)
      .catch(() => {
        throw new Error(context.i18n._(msg`Failed to fetch user`))
      })
  },
  errorComponent: UserErrorComponent,
  component: UserComponent,
  notFoundComponent: () => {
    return (
      <NotFound>
        <Trans>User not found</Trans>
      </NotFound>
    )
  },
})

function UserComponent() {
  const user = Route.useLoaderData()

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">{user.name}</h4>
      <div className="text-sm">{user.email}</div>
    </div>
  )
}
