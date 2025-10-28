export async function load() {
  const { t } = await import("@lingui/core/macro")
  return t`Ola`
}
