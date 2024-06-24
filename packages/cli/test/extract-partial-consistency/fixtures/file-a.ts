import { i18n } from "@lingui/core"
import { defineMessage, t } from "@lingui/macro"

const msg = t`Hello world`

const msg2 = t({
  message: "Hello world",
  context: "custom context",
})

const msg3 = null /* original translation commented to mark message obsolete *//*t({
  message: "This message has custom id",
  id: "custom.id",
})*/

const msgDescriptor = defineMessage({
  message: "Message in descriptor",
})

i18n._(msgDescriptor)

i18n._("addToCart")
i18n._({id: "addToCart", message: "Add To Cart with change ignored"})