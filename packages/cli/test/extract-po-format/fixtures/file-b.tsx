import { Trans } from "@lingui/macro"
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


export function MyComponent4() {
  return <div>
    <Trans comment="multi line
    comment 1">
      translation with multi line comment 1
    </Trans>
    <Trans comment={`multi line
    comment 2`}>
      translation with multi line comment 2
    </Trans>
  </div>
}