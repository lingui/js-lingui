const deserialize = (minimalCatalog: Record<string, any>) => {
  const result: Record<string, any> = {}
  for (const key in minimalCatalog) {
    result[key] = {
      translation: minimalCatalog[key],
      obsolete: false,
      message: null,
      origin: [],
    }
  }
  return result
}

const PARSERS = {
  minimal: <T>(content: Record<string, any> | T) => {
    return deserialize(content as Record<string, any>)
  },
}

export default PARSERS
