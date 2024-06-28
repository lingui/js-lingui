<script lang="ts">
import { defineComponent } from "vue"
import { i18n } from "@lingui/core"

// @ts-ignore only used to check if extractor doesn't crash with Typescript
const foo: number = 5

export default defineComponent({
  render(createElement) {
    return createElement('div', [i18n._("Render function message")])
  }})
</script>
