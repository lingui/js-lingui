// Lazy per-entry catalogs: every locale of every catalog is a separate module
const catalogs = import.meta.glob([
  "./pages/locales/*/*.po",
  "./components/*/locale/*.po",
])

export async function load() {
  const result = {}

  for (const file of Object.keys(catalogs).sort()) {
    result[file] = (await catalogs[file]()).messages
  }

  return result
}
