import { defineComponent } from "vue"
import { useLingui } from "@lingui/vue/macro"
import { msg } from "@lingui/core/macro"

// Messages defined outside the component
const labels = {
  red: {
    label: msg`Red`,
    color: "rgb(239, 68, 68)",
  },
  blue: {
    label: msg`Blue`,
    color: "rgb(59, 130, 246)",
  },
  orange: {
    label: msg`Orange`,
    color: "rgb(249, 115, 22)",
  },
}

/**
 * JSX/TSX components use the macros from `@lingui/vue/macro`
 */
export const MsgExample = defineComponent({
  name: "MsgExample",
  setup() {
    const { t } = useLingui()

    return () => (
      <div
        data-testid="msg-example"
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          gap: "12px",
        }}
      >
        {Object.entries(labels).map(([key, { label, color }]) => (
          <div
            key={key}
            style={{
              background: color,
              color: "white",
              padding: "10px 14px",
              borderRadius: "8px",
              fontWeight: "600",
              minWidth: "80px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {t(label) + " "}
          </div>
        ))}
      </div>
    )
  },
})
