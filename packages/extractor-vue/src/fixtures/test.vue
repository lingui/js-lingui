<script setup>
import { i18n } from "@lingui/core"
import { defineComponent } from "vue"

i18n._("Setup message")
</script>

<script lang="ts">
// @ts-ignore only used to check if extractor doesn't crash with Typescript
const foo: number = 5

export default defineComponent({
  data() {
    return {
      i18n,
      scriptString: i18n._("Script message"),
    }
  },
})
</script>

<template>
  {{ i18n.t(/*i18n*/ { id: "custom.id", message: "My message" }) }}
  {{
    i18n.t(
      /*i18n*/ {
        message: "My descriptor message",
        id: "my.message",
        comment: "Message comment",
      }
    )
  }}
  {{ i18n._(/*i18n*/ "id used as message") }}
  {{ i18n.t(/*i18n*/ { id: "My message without ID and context" }) }}
</template>
