import { defineWorkspace } from "vitest/config"

export default defineWorkspace(["./packages/**/vite.config.mts"])
//
// export default ["packages/**/vite.config.mts"]
