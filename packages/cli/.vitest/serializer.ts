import { stripVTControlCharacters } from "node:util"

export default {
  test: (val) => typeof val === "string",
  print: (val) => stripVTControlCharacters(val),
}
