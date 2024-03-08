import { useEffect, useState } from "react"
import reactLogo from "./assets/react.svg"
import linguiLogo from "./assets/lingui-logo.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import { Plural, Trans } from "@lingui/react.macro"
import { I18nProvider } from "@lingui/react"
import { i18n } from "@lingui/core"
import { loadCatalog } from "./i18n"

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    loadCatalog("en")
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <div className="App">
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
          <a href="https://lingui.dev" target="_blank">
            <img src={linguiLogo} className="logo react" alt="Lingui logo" />
          </a>
        </div>
        <h1>Vite + React + Lingui</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            <Plural value={count} one="# month" other="# months" />
          </button>
          <p>
            <Trans>
              Edit <code>src/App.tsx</code> and save to test HMR
            </Trans>
          </p>
          <p>
            <button
              style={{ marginRight: "20px" }}
              onClick={() => loadCatalog("pl")}
            >
              Polish
            </button>
            <button onClick={() => loadCatalog("en")}>English</button>
          </p>
        </div>
        <p className="read-the-docs">
          <Trans>Click on the Vite and React logos to learn more</Trans>
        </p>
      </div>
    </I18nProvider>
  )
}

export default App
