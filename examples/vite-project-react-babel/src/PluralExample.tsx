import { Plural, useLingui } from "@lingui/react/macro"
import { useState } from "react"

export function PluralExample() {
  const [count, setCount] = useState(0)

  const {t} = useLingui();

  return  <button data-testid="plural-button" title={t`Click on this button to test plurals`} onClick={() => setCount((count) => count + 1)}>
    <Plural value={count} one="# month" other="# months" />
  </button>
}