import { sha256 } from "@noble/hashes/sha2.js"
import { UNIT_SEPARATOR } from "./constants"

const textEncoder = new TextEncoder()

export function generateMessageId(msg: string, context = "") {
  const hashBytes = sha256(
    textEncoder.encode(msg + UNIT_SEPARATOR + (context || "")),
  )

  return btoa(String.fromCharCode(...hashBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, 6)
}
