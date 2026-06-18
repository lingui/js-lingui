import { Trans, msg, t } from "#macros"

const greeting = t`Hello from a custom macro package`

const farewell = msg`Goodbye from a custom macro package`

export function Page() {
  console.log(greeting, farewell)
  return <Trans>Rendered through a custom macro package</Trans>
}
