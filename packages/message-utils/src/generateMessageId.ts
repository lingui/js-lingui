import { sha256 } from "js-sha256"
import { UNIT_SEPARATOR } from "./constants"

export function generateMessageId(msg: string, context = "") {
  const hashBytes = sha256.array(msg + UNIT_SEPARATOR + (context || ""))

  return btoa(String.fromCharCode(...hashBytes)).slice(0, 6)
}
