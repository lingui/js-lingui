import { defineComponent } from "vue"
import { Trans, useLingui } from "@lingui/vue/macro"

export default defineComponent({
  name: "Tsx",
  setup() {
    const { t } = useLingui()

    return () => (
      <p id="tsx">
        {t`Hi`} <Trans>from TSX</Trans>
      </p>
    )
  },
})
