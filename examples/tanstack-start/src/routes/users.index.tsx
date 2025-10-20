import { msg } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/users/")({
  component: UsersIndexComponent,
  loader({ context }) {
    return {
      options: [
        { label: context.i18n._(msg`Home`), value: "home" },
        { label: context.i18n._(msg`Posts`), value: "posts" },
      ],
    }
  },
})

function UsersIndexComponent() {
  const { options } = Route.useLoaderData()

  return (
    <div>
      <Trans>Select a user.</Trans>
      <form>
        <input type="text" name="search" />
        <select>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>
    </div>
  )
}
