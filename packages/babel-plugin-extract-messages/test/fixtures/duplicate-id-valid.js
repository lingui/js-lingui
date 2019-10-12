import * as React from 'react'
import { Trans } from "@lingui/react"

// OK - Default message is missing
/*i18n*/i18n._("msg")

// OK - Default message is empty
/*i18n*/i18n._("msg", {}, { message: "" })

// OK - Default message is defined for the first time
(<Trans id="msg" message="Hello World!" />)

// OK - Default message is still empty, so it doesn't overwrite existing one
/*i18n*/i18n._("msg", {}, {
  message: ""
})
