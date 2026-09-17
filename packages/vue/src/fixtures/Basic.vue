<script setup lang="ts">
import { ref } from "vue"
import { Plural, Trans, useLingui } from "../index"

defineProps<{ name: string; count: number; items: string[] }>()

const { t, i18n } = useLingui()
const url = ref("/docs")
</script>

<template>
  <div>
    <p data-testid="trans">
      <Trans>
        Hello <b>{{ name }}</b>, read the <a :href="url">docs</a>.
      </Trans>
    </p>
    <p data-testid="plural">
      <Plural :value="count" one="# book" other="# books" />
    </p>
    <p data-testid="rich-plural">
      <Plural :value="count" other="# books">
        <template #one>One <em>{{ name }}</em> book</template>
      </Plural>
    </p>
    <input data-testid="input" :placeholder="t`Search`" />
    <p data-testid="t">{{ t`Hello ${name}` }}</p>
    <ul>
      <li v-for="item in items" :key="item"><Trans>Item {{ item }}</Trans></li>
    </ul>
    <p data-testid="custom">
      <Trans id="custom.id" comment="A comment">Custom</Trans>
    </p>
    <p data-testid="locale">{{ i18n.locale }}</p>
    <p data-testid="runtime">
      <Trans id="custom.id" message="Custom" />
    </p>
  </div>
</template>
