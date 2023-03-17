export async function load() {
  return import("@lingui/loader?option=foo!./locale/en.po")
}
