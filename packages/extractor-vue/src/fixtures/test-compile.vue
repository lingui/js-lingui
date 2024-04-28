<script setup lang="ts">
import { i18n } from '@lingui/core';

let message = i18n._("Hello World")
</script>

<template lang="pug">
  <div :bar="a[" v-model="baz"/>
  {{ message }}
</template>