export async function load() {
  return (await import("@lingui/loader!./locale/en.json")).default
}
