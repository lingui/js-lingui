<template>
  <p>{{ i18n._("Template message") }}</p>
</template>

<script setup lang="ts">
import { i18n } from "@lingui/core"

const message: string = i18n._("Setup message")
</script>
