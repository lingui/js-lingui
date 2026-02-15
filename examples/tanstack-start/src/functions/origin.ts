import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

export const getOrigin = createIsomorphicFn()
  .server(() => {
    const request = getRequest()
    const url = new URL(request.url)

    return url.origin
  })
  .client(() => "")
