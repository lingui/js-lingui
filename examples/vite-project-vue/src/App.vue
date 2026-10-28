<script setup lang="ts">
import { Trans, useLingui } from "@lingui/vue/macro"
import vueLogo from "./assets/vue.svg"
import linguiLogo from "./assets/lingui-logo.svg"
import { loadCatalog } from "./i18n"
import PluralExample from "./PluralExample.vue"
import SelectExample from "./SelectExample.vue"
import { MsgExample } from "./MsgExample"
import "./App.css"

const { i18n } = useLingui()
</script>

<template>
  <div class="App">
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org" target="_blank">
        <img :src="vueLogo" class="logo vue" alt="Vue logo" />
      </a>
      <a href="https://lingui.dev" target="_blank">
        <img :src="linguiLogo" class="logo vue" alt="Lingui logo" />
      </a>
    </div>
    <h1>Vite + Vue + Lingui</h1>
    <div class="card">
      <PluralExample />
      <SelectExample />
      <MsgExample />
      <p data-testid="edit-text">
        <Trans>Edit <code>src/App.vue</code> and save to test HMR</Trans>
      </p>
      <p>
        <button style="margin-right: 20px" @click="loadCatalog('pl', i18n)">
          Polish
        </button>
        <button @click="loadCatalog('en', i18n)">English</button>
      </p>
    </div>
    <p class="read-the-docs">
      <Trans>Click on the Vite and Vue logos to learn more</Trans>
    </p>
  </div>
</template>
