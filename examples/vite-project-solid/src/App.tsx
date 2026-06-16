import solidLogo from "./assets/solid.svg"
import linguiLogo from "./assets/lingui-logo.svg"
import "./App.css"
import { Trans, useLingui } from "@lingui/solid/macro"
import { loadCatalog } from "./i18n"
import { PluralExample } from "./PluralExample"
import { MsgExample } from "./MsgExample"

export function App() {
  const { i18n } = useLingui()

  return (
    <div class="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
        <a href="https://lingui.dev" target="_blank">
          <img src={linguiLogo} class="logo solid" alt="Lingui logo" />
        </a>
      </div>
      <h1>Vite + Solid + Lingui</h1>
      <div class="card">
        <PluralExample />
        <MsgExample />
        <p data-testid="edit-text">
          <Trans>
            Edit <code>src/App.tsx</code> and save to test HMR
          </Trans>
        </p>
        <p>
          <button
            style={{ "margin-right": "20px" }}
            onClick={() => loadCatalog("pl", i18n())}
          >
            Polish
          </button>
          <button onClick={() => loadCatalog("en", i18n())}>English</button>
        </p>
      </div>
      <p class="read-the-docs">
        <Trans>Click on the Vite and Solid logos to learn more</Trans>
      </p>
    </div>
  )
}
