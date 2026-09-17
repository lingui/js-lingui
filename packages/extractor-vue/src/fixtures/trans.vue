<script setup lang="ts">
import { ref } from "vue"
import { Plural, Select, Trans, useLingui } from "@lingui/vue"

const { t } = useLingui()
const name = ref("John")
const count = ref(1)
const gender = ref("male")
</script>

<template>
  <div>
    <p>
      <Trans>
        Hello <b>{{ name }}</b>, read the <a href="/docs">docs</a>.
      </Trans>
    </p>
    <p>
      <Trans id="custom.id" comment="Greeting shown on the homepage" context="direction">Right</Trans>
    </p>
    <p>
      <Plural :value="count" one="# book" other="# books" />
      <Select :value="gender" _male="His book" _female="Her book" other="Their book" />
    </p>
    <input :placeholder="t`Search`" />
    <p>{{ t`Hello ${name}` }}</p>
    <p>{{ t({ message: "Descriptor message", comment: "Descriptor comment" }) }}</p>
    <p>
      <Trans>Total {{ count + count }} by {{ user.first + user.last }}</Trans>
    </p>
    <ul>
      <li v-for="(label, i) in [t`Daily`, t`Weekly`]" :key="i">{{ label }}</li>
    </ul>
    <button @click="save(); toast = t`Saved`">{{ t`Save` }}</button>
    <p>
      <Trans id="runtime.id" message="Hello {name}" comment="Runtime usage" :values="{ name }" />
      <Trans id="runtime.link" message="Read <link>Description</link> below.">
        <template #link><a href="/docs" /></template>
      </Trans>
      <Trans id="runtime.dynamic" :message="dynamicMessage" comment="Dynamic message" />
      <Trans :id="dynamicId" message="Not extracted, dynamic id" />
      <Trans :id="dynamicId" :message="dynamicMessage" comment="Not extracted, dynamic usage" />
    </p>
  </div>
</template>
