<script setup lang="ts">
import { ref } from "vue"
import { Select, useLingui } from "@lingui/vue/macro"

const gender = ref<"male" | "female" | "other">("male")
const { t } = useLingui()
</script>

<template>
  <p data-testid="select-example">
    <label>
      {{ t`Whose inbox?` }}
      <select v-model="gender" data-testid="gender-select">
        <option value="male">male</option>
        <option value="female">female</option>
        <option value="other">other</option>
      </select>
    </label>
    <span data-testid="select-message">
      <Select
        :value="gender"
        _male="His inbox"
        _female="Her inbox"
        other="Their inbox"
      />
    </span>
  </p>
</template>
