import { i18n } from "@lingui/core"
import { hydrateRoot } from "react-dom/client"
import { StartClient } from "@tanstack/react-start"
import { dynamicActivate } from "./modules/lingui/i18n"

import { createRouter } from "./router"
import { startTransition, StrictMode } from "react"

// The lang should be set by the server
await dynamicActivate(document.documentElement.lang)

const router = createRouter({ i18n })

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient router={router} />
		</StrictMode>,
	);
});
