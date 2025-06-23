import { setupI18n } from "@lingui/core"
import { hydrateRoot } from "react-dom/client"
import { StartClient } from "@tanstack/react-start"

import { createRouter } from "./router"
import { startTransition, StrictMode } from "react"

// The lang should be set by the server
const i18n = setupI18n({})

const router = createRouter({ i18n })

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient router={router} />
    </StrictMode>
  )
})
