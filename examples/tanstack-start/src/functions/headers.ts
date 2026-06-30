import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

export const getIsomorphicHeaders = createIsomorphicFn()
  .server(async () => {
    return getRequestHeaders()
  })
  .client(() => {
    return {}
  })
