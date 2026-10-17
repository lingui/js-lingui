<template>
  <p>{{ message }}</p>
</template>

<script setup>
import { i18n } from "@lingui/core"

const message = i18n._("JS setup message")
</script>
