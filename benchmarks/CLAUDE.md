# Benchmark Suite — Developer Guide

## Architecture

```
benchmarks/
  src/
    run-benchmarks.ts          ← Main entry: parses args, generates fixtures, runs scenarios, reports
    generate-fixtures.ts       ← Standalone fixture generation (same logic as run-benchmarks)
    presets.ts                 ← Preset definitions (small/medium/large)
    generators/
      message-pool.ts          ← Pool of ~80 unique message templates (simple, interpolated, plural)
      jsx-file-generator.ts    ← Generates .tsx React components using @lingui/react/macro
      js-file-generator.ts     ← Generates .ts files using @lingui/core/macro
      po-catalog-generator.ts  ← Generates pre-existing PO catalogs with translations
    scenarios/
      extract.bench.ts         ← Benchmarks the extract command (babel vs swc × 1/2 workers)
      extract-template.bench.ts← Benchmarks extract-template command
      compile.bench.ts         ← Benchmarks compile command
      macro-transform.bench.ts ← Pure Babel vs SWC plugin transform (no CLI, no I/O)
    reporters/
      console-reporter.ts      ← Prints cli-table3 tables to stdout
      json-reporter.ts         ← Writes .results/results.json
    utils/
      config-builder.ts        ← Builds LinguiConfigNormalized + writes a config file to disk
      silence.ts               ← Suppresses console/stdout during benchmark iterations
      deterministic-random.ts  ← Seeded PRNG (unused currently, available for future use)
```

## Key Patterns

### How scenarios call the CLI

Each scenario imports the `command()` function from `@lingui/cli/commands/*` (exports added in `packages/cli/package.json`). These are the same functions the CLI binary calls internally:

```ts
const { default: extractCommand } = await import("@lingui/cli/commands/extract")
await extractCommand(config, { verbose: false, clean: false, overwrite: false, workersOptions: { poolSize: 0 } })
```

The `workersOptions: { poolSize: 0 }` means single-threaded. `{ poolSize: 2 }` spawns 2 worker threads.

### Config building

`buildConfig()` in `utils/config-builder.ts` does two things:
1. Calls `makeConfig()` from `@lingui/conf` with `skipValidation: true`
2. Writes a dummy `lingui.config.js` file to the fixtures dir (required because multi-worker mode needs `resolvedConfigPath` to reload config in workers)

The SWC extractor variant is configured by passing `extractors: [createSwcExtractor()]` from the `lingui-swc` npm package.

### Console suppression

CLI commands print progress (spinners, stats). The `silenceConsole()` helper monkey-patches `console.*` and `process.stdout/stderr.write` during iterations. Always restore in a `finally` block.

### Fixture generation

Messages are deterministic — same preset always produces identical fixtures. The `message-pool.ts` provides ~150 base templates combined with file-specific qualifiers to achieve **10-18% message reuse** (realistic for a large project).

**Message variety mechanisms:**
- ~150 curated templates (60 simple, 70 interpolated with ~30% using complex expressions like `user.name`, `formatDate()`, 20 plurals)
- ~30% of messages are longer (20-50 words) simulating tooltips, descriptions, error messages
- File-scoped qualifiers ("for this project", "in your workspace" etc.) appended to ~85% of simple/interpolated messages, varying by file index to reduce collisions
- `getMessageAtIndex(fileIndex, msgIndex, isPlural)` uses coprime strides to distribute selection across the pool

**Macro patterns exercised:**
- `<Trans>` and `<Plural>` JSX macros
- `useLingui()` hook — ~30% of messages in JSX files use `const { t } = useLingui()` + `` t`...` ``
- `t` tagged template and `plural()` in JS files
- `// lingui-set context="..." comment="..."` directives on ~20% of files (file index % 5 === 0)
- `// lingui-reset` mid-file on some directive files
- Complex placeholder expressions: `${user.name}`, `${cart.getSubtotal()}`, `${formatDate(user.lastLogin)}`

**PO catalog generation** uses real extraction: the generator runs `lingui extract-template` against the generated source files to produce a template with correct origins (`#: file:line` references). It then populates 90% of entries with translations and writes per-locale `.po` files using the `@lingui/format-po` formatter with `origins: true`. PO files contain realistic `#:` reference lines, `#.` placeholder comments for complex expressions, and `msgctxt` for context-scoped messages.

Catalog overlap: 90% of unique messages have pre-existing translations. The remaining 10% simulate newly added code not yet in catalogs (empty translation string).

## Adding a New Scenario

1. Create `src/scenarios/my-scenario.bench.ts`:
```ts
import { Bench } from "tinybench"
import type { PresetConfig } from "../presets.js"
import { buildConfig } from "../utils/config-builder.js"
import { silenceConsole } from "../utils/silence.js"

export async function runMyBenchmark(fixturesDir: string, preset: PresetConfig) {
  const bench = new Bench({ warmup: 1, iterations: 3 })

  bench.add("variant A", async () => {
    const restore = silenceConsole()
    try { /* ... */ } finally { restore() }
  })

  await bench.run()
  return bench
}
```

2. Wire it in `run-benchmarks.ts`:
```ts
import { runMyBenchmark } from "./scenarios/my-scenario.bench.js"

// In main(), add:
if (!selectedScenario || selectedScenario === "my-scenario") {
  console.log("\nRunning: My Scenario...")
  const bench = await runMyBenchmark(fixturesDir, preset)
  printScenario("My Scenario", bench, "ops/s", someDivisor)
  scenarios.push({ name: "my-scenario", bench, throughputDivisor: someDivisor, throughputUnit: "ops/s" })
}
```

## Adding More Message Variety

The message pool in `generators/message-pool.ts` has ~80 unique messages. For large presets (5000 files × 10 msgs = 50000) messages repeat. To increase variety:
- Add entries to `SIMPLE_MESSAGES`, `INTERPOLATED_MESSAGES`, or `PLURAL_MESSAGES` arrays
- Or use the `SeededRandom` class from `utils/deterministic-random.ts` to compose messages procedurally (e.g., combining template parts)

## Important Details

- **Build first**: workspace packages must be built (`yarn release:build`) because imports resolve through `exports` fields pointing to `./dist/`
- **Multi-worker requires config file on disk**: the CLI's worker pool re-loads config from `resolvedConfigPath` in each thread. That's why `config-builder.ts` writes a config file.
- **SWC plugin WASM overhead**: the `@lingui/swc-plugin` has per-call WASM init cost when called via `@swc/core.transform()`. The `lingui-swc` extractor batches internally and amortizes this. So the `macro-transform` scenario (per-file transform) shows different perf characteristics than the `extract` scenario (batched extractor).
- **Unique message count**: with qualifiers and context, the catalog contains ~85-90% of total source messages as unique entries (e.g., medium preset: ~8200 unique entries from 10000 source messages). This is realistic for a large project with moderate message sharing.
- **Fixture generation is async**: `generatePoCatalogs()` runs actual extraction via `lingui extract-template` command, so it must be awaited. This makes fixture generation slower (~400ms for small) but produces realistic PO files with proper origin references.
- **PO origins**: the formatter uses `origins: true` — catalogs contain `#: src/components/Component0000.tsx:33` references. This adds serialization/parsing cost that a real project would have.

## CLI reference

```
tsx src/run-benchmarks.ts [options]

Options:
  --preset <name>          small | medium | large (default: medium)
  --files <n>              Override file count
  --messages-per-file <n>  Override messages per file
  --locales <list>         Comma-separated locale list
  --scenario <name>        Run only: extract | extract-template | compile | macro-transform
  --skip-generate          Reuse existing fixtures (must have been generated before)
```
