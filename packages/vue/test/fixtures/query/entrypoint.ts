// A query doesn't change what a module is, e.g. Vitest's automocks
import { greeting as queried } from "./greeting.ts?mock=automock"
// …unless it asks for another form of the file
import raw from "./greeting.ts?raw"
import { greeting } from "./greeting"

export { greeting, queried, raw }
