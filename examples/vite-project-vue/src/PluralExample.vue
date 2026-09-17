<script setup lang="ts">
import { ref } from "vue"
import { Plural, useLingui } from "@lingui/vue/macro"

const count = ref(0)
const { t } = useLingui()
</script>

<template>
  <button
    data-testid="plural-button"
    :title="t`Click on this button to test plurals`"
    @click="count++"
  >
    <Plural :value="count" one="# month" other="# months" />
  </button>
</template>
