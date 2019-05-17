import { Trans } from "@lingui/react"

// OK - Default message is defined here
;<Trans id="msg" message="Hello World" />

// Error! - Attempt to redefine the defaultm essage
;<Trans id="msg" message="Different default message" />
