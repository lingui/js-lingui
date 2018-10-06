import lingui from "./lingui"
import minimal from "./minimal"
import po from "./po"

const formats = { lingui, minimal, po }

export default function getFormat(name) {
  const format = formats[name]
  if (!format) {
    throw new Error(
      `Unknown format "${name}". Use one of following: ${Object.keys(
        formats
      ).join(", ")}`
    )
  }

  return format
}
