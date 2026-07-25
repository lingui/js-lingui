import "@lingui/core"

declare module "@lingui/core" {
  interface Register {
    messageIds: "welcome.title" | "welcome.body" | "greeting"
  }
}
