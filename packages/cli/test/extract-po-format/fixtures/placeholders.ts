import { t } from "@lingui/core/macro"

t`Hello ${user.name}`
t`Hello ${author.name}`
t`Hello ${moderator.name}`

t`Hello ${userName} ${user.name} ${
  // prettier-ignore
  user
    ? user.name
    : null
}`
