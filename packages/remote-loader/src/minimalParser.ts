import * as R from "ramda"

const deserialize = (R.map((translation: string) => ({
  translation,
  obsolete: false,
  message: null,
  origin: [],
})) as unknown) as (minimalCatalog: any) => any

const PARSERS = {
  minimal: <T>(content: Record<string, any> | T) => {
    return deserialize(content)
  }
}

export default PARSERS
