<script setup lang="ts">
import { ref } from "vue"
import { Trans } from "../index"

defineProps<{ show: boolean }>()

const inner = ref<HTMLElement | null>(null)
defineExpose({ inner })
</script>

<template>
  <p data-testid="scoped">
    <Trans>
      Hello <b v-show="show" class="x">world</b>, see <i ref="inner">ref</i>.
    </Trans>
  </p>
</template>

<style scoped>
.x {
  color: red;
}
</style>
