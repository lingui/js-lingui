<script setup lang="ts">
import { i18n } from "@lingui/core";

let firstMessage = i18n._('Hello World')
let secondMessage = i18n._('Goodbye Vue')
</script>

<template>
  <p>1st template</p>
  <small>{{ firstMessage }}</small>
</template>
<template>
  <p>2nd template</p>
  <small>{{ secondMessage }}</small>
</template>