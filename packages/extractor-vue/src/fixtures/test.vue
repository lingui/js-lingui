<script setup lang="ts">
import { i18n } from "@lingui/core"

i18n._("Setup message")
let x: string | number = 1
</script>

<script lang="ts">
import { defineComponent } from "vue"
import { i18n } from "@lingui/core"

// @ts-ignore only used to check if extractor doesn't crash with Typescript
const foo: number = 5

export default defineComponent({
  data() {
    return {
      i18n,
      scriptString: i18n.t("Script message"),
    }
  },
})
</script>

<template>
  {{ (x as number).toFixed(2) }}
  {{ i18n.t({ id: "custom.id", message: "My message" }) }}
  {{
    i18n.t({
        message: "My descriptor message",
        id: "my.message",
        comment: "Message comment",
      })
  }}
  {{ i18n._("id used as message") }}
  {{ i18n.t({ id: "My message without ID and context" }) }}
</template>
