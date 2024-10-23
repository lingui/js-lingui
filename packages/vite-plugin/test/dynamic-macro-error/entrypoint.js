export async function load() {
  const { t } = await import("@lingui/macro")
  return t`Ola`
}
