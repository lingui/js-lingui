import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { loadCatalog } from "./i18n"

// load initial language, you can detect here a user language with your preferred method
await loadCatalog("en")

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
