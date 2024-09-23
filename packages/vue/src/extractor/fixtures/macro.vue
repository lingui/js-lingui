<script setup lang="ts">
import { Trans, vt } from "@lingui/vue"
import { t, plural } from "@lingui/core/macro"

t`Hello from core macro`
const name = ""
const town = ""
const persona = ""
const count = 5
</script>

<template>
  <Trans>Simple Trans</Trans>
  <Trans context="another">Simple Trans</Trans>
  <Trans comment="this is a comment">Trans with Comment</Trans>

  <Trans id="some.id">Trans With Id</Trans>

  <Trans
    >Hello <em>{{ name }}</em> welcome to {{ town }} <br />
    <span
      >you are now
      <em
        ><i>a {{ persona }}</i></em
      ></span
    >!</Trans
  >

  <img :title="vt`Hello ${name}`" src="" />

  <img :title="plural(count, { one: '# book', other: '# books' })" src="" />
</template>
