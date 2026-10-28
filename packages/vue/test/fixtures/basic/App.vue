<script setup lang="ts">
import { computed } from "vue"
import { Plural, Trans, useLingui } from "@lingui/vue/macro"
import { msg } from "@lingui/core/macro"
import Tsx from "./Tsx"

const props = defineProps<{ name: string; count: number }>()

const { t, i18n } = useLingui()

const greeting = computed(() => t`Welcome ${props.name}`)
const bye = msg`Bye`
</script>

<template>
  <div>
    <p id="trans">
      <Trans>
        Hello <b>{{ name }}</b>, read the <a href="/docs">docs</a>.
      </Trans>
    </p>
    <p id="plural">
      <Plural :value="count" one="# book" other="# books" />
    </p>
    <input id="input" :placeholder="t`Search`" />
    <p id="t">{{ t`Hello ${name}` }}</p>
    <p id="script">{{ greeting }}</p>
    <p id="msg">{{ i18n._(bye) }}</p>
    <p id="locale">{{ i18n.locale }}</p>
    <Tsx />
  </div>
</template>
