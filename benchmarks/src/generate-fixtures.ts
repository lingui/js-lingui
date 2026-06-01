import path from "path"
import fs from "fs"
import { parseArgs } from "node:util"
import { PRESETS, type PresetConfig } from "./presets.js"
import { generateJsxFile } from "./generators/jsx-file-generator.js"
import { generateJsFile } from "./generators/js-file-generator.js"
import { generatePoCatalogs } from "./generators/po-catalog-generator.js"

const FIXTURES_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  ".fixtures",
)

const { values } = parseArgs({
  options: {
    preset: { type: "string", default: "medium" },
    files: { type: "string" },
    "messages-per-file": { type: "string" },
    locales: { type: "string" },
  },
  strict: false,
})

function resolvePreset(): PresetConfig {
  const presetName = String(values.preset || "medium")
  const base = PRESETS[presetName]!
  return {
    ...base,
    files: values.files ? Number(values.files) : base.files,
    messagesPerFile: values["messages-per-file"]
      ? Number(values["messages-per-file"])
      : base.messagesPerFile,
    locales: values.locales ? String(values.locales).split(",") : base.locales,
  }
}

async function generateFixtures(preset: PresetConfig) {
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true })
  }

  const componentsDir = path.join(FIXTURES_DIR, "src", "components")
  const utilsDir = path.join(FIXTURES_DIR, "src", "utils")
  fs.mkdirSync(componentsDir, { recursive: true })
  fs.mkdirSync(utilsDir, { recursive: true })

  const jsxCount = Math.ceil(preset.files / 2)
  const jsCount = preset.files - jsxCount

  console.log(
    `Generating fixtures: ${preset.files} files, ${preset.messagesPerFile} msgs/file, ${preset.locales.length} locales`,
  )

  const startTime = Date.now()

  for (let i = 0; i < jsxCount; i++) {
    const content = generateJsxFile(i, preset.messagesPerFile)
    const padded = String(i).padStart(4, "0")
    fs.writeFileSync(
      path.join(componentsDir, `Component${padded}.tsx`),
      content,
    )
  }

  for (let i = 0; i < jsCount; i++) {
    const fileIndex = jsxCount + i
    const content = generateJsFile(fileIndex, preset.messagesPerFile)
    const padded = String(fileIndex).padStart(4, "0")
    fs.writeFileSync(path.join(utilsDir, `util${padded}.ts`), content)
  }

  console.log(`  Source files generated in ${Date.now() - startTime}ms`)

  const catalogStart = Date.now()
  await generatePoCatalogs(FIXTURES_DIR, preset)
  console.log(`  PO catalogs generated in ${Date.now() - catalogStart}ms`)

  // Save preset config so bench can read it without needing --preset
  fs.writeFileSync(
    path.join(FIXTURES_DIR, "preset.json"),
    JSON.stringify(preset, null, 2),
  )

  console.log(`  Fixtures directory: ${FIXTURES_DIR}`)
}

const preset = resolvePreset()
await generateFixtures(preset)
