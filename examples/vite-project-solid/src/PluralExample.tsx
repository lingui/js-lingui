import { createSignal } from "solid-js"
import { Plural, useLingui } from "@lingui/solid/macro"

export function PluralExample() {
  const [count, setCount] = createSignal(0)
  const { t } = useLingui()

  return (
    <button
      data-testid="plural-button"
      title={t`Click on this button to test plurals`}
      onClick={() => setCount((count) => count + 1)}
    >
      <Plural value={{ count: count() }} one="# month" other="# months" />
    </button>
  )
}
