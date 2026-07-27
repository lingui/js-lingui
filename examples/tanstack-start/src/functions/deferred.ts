import { createServerFn } from "@tanstack/react-start"

export const personServerFn = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(({ data: name }) => {
    return { name, randomNumber: Math.floor(Math.random() * 100) }
  })

export const slowServerFn = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: name }) => {
    await new Promise((r) => setTimeout(r, 1000))
    return { name, randomNumber: Math.floor(Math.random() * 100) }
  })
