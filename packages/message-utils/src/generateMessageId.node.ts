import { createHash } from "node:crypto"
import { UNIT_SEPARATOR } from "./constants"

export const generateMessageId = (msg: string, context = "") => {
  const hash = createHash("sha256")
    .update(msg + UNIT_SEPARATOR + (context || ""))
    .digest("base64")

  return hash.slice(0, 6)
}
