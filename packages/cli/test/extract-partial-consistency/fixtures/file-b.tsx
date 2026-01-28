import { Trans } from "@lingui/react/macro"
import React from "react"

export function MyComponent() {
  return (
    <Trans comment={"this is a comment"}>Hello this is JSX Translation</Trans>
  )
}

export function MyComponent2() {
  return <Trans context="my context">Hello this is JSX Translation</Trans>
}

export function MyComponent3() {
  return <Trans id={"jsx.custom.id"}>This JSX element has custom id</Trans>
}
