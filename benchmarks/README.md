# Lingui CLI Benchmarks

Performance benchmarks for lingui CLI operations: message extraction, compilation, and macro transformation.

## Quick Start

```bash
# Build workspace packages first (required once)
yarn release:build

# Run all benchmarks with medium preset (1000 files)
yarn workspace @lingui/benchmarks bench

# Smaller/faster run for development
yarn workspace @lingui/benchmarks bench --preset small

# Full-scale benchmark
yarn workspace @lingui/benchmarks bench --preset large
```

## Presets

| Preset | Files | Messages | Locales | Approx. Runtime |
|--------|-------|----------|---------|-----------------|
| small  | 100   | 1,000    | 3       | ~30s            |
| medium | 1,000 | 10,000   | 5       | ~3min           |
| large  | 5,000 | 50,000   | 5       | ~15min          |

Override individual parameters:

```bash
yarn workspace @lingui/benchmarks bench --files 500 --messages-per-file 20 --locales en,fr
```

## Scenarios

Run a specific scenario with `--scenario <name>`:

```bash
yarn workspace @lingui/benchmarks bench --scenario extract
```

### `extract` — Full extraction pipeline

Runs `lingui extract` command: scan source files → transform macros → extract messages → merge with existing PO catalogs → serialize and write.

Tested with: Babel extractor vs SWC extractor (`lingui-swc`), 1 worker vs 2 workers.

### `extract-template` — Extraction without merge

Runs `lingui extract-template`: same as extract but skips merging with existing catalogs. Isolates pure extraction + serialization cost.

### `compile` — Catalog compilation

Runs `lingui compile`: read PO catalogs → parse ICU messages → generate compiled JS modules → write files.

### `macro-transform` — Pure macro transformation

Isolated benchmark of macro transformation speed (no file I/O, no catalog logic). Compares:
- **Babel**: `@lingui/babel-plugin-lingui-macro` via `@babel/core.transformAsync`
- **SWC**: `@lingui/swc-plugin` via `@swc/core.transform`

## Output

- **Console**: Pretty tables printed to stdout
- **JSON**: Machine-readable results at `.results/results.json`

## Other Commands

```bash
# Generate fixtures without running benchmarks
yarn workspace @lingui/benchmarks generate --preset medium

# Reuse previously generated fixtures (skip regeneration)
yarn workspace @lingui/benchmarks bench --skip-generate --preset medium
```

## How Fixtures Work

The benchmark generates a simulated project:
- 50% `.tsx` files with `<Trans>` and `<Plural>` (JSX macros)
- 50% `.ts` files with `` t` ` `` and `plural()` (JS macros)
- ~10% of messages are plurals
- Pre-existing PO catalogs with 90% of messages already translated (simulates mature project with incremental new messages)
- Translations are `[locale] Original message` to have realistic serialized content

## Dependencies

- `tinybench` — benchmarking framework
- `@swc/core` + `@lingui/swc-plugin` — SWC macro transformation
- `lingui-swc` — Rust-based extractor for the CLI
- `cli-table3` — console table formatting
- Workspace packages: `@lingui/cli`, `@lingui/conf`, `@lingui/format-po`, etc.
