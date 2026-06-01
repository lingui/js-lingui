import path from "path"
import fs from "fs"
import { parseArgs } from "node:util"
import { PRESETS, type PresetConfig } from "./presets.js"
import { generateJsxFile } from "./generators/jsx-file-generator.js"
import { generateJsFile } from "./generators/js-file-generator.js"
import { generatePoCatalogs } from "./generators/po-catalog-generator.js"

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

function generateFixtures(preset: PresetConfig) {
  const benchDir = path.dirname(new URL(import.meta.url).pathname)
  const fixturesDir = path.resolve(benchDir, "..", ".fixtures", preset.name)

  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(fixturesDir, { recursive: true })
  }

  const componentsDir = path.join(fixturesDir, "src", "components")
  const utilsDir = path.join(fixturesDir, "src", "utils")
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
  generatePoCatalogs(fixturesDir, preset)
  console.log(`  PO catalogs generated in ${Date.now() - catalogStart}ms`)

  console.log(`  Fixtures directory: ${fixturesDir}`)
}

const preset = resolvePreset()
generateFixtures(preset)
