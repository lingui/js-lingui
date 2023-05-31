import { t } from "@lingui/macro"

const msg = t`Hello world`

const msg3 = t({
  message: "This message has custom id",
  id: "custom.id",
})
