# Lingui CLI Benchmarks

Performance benchmarks for lingui CLI operations: message extraction, compilation, and macro transformation.

## Quick Start

```bash
# Build workspace packages first (required once)
yarn release:build

# Step 1: Generate fixtures
yarn workspace @lingui/benchmarks generate --preset small

# Step 2: Run benchmarks
yarn workspace @lingui/benchmarks bench
```

## Presets

| Preset | Files | Messages | Locales |
|--------|-------|----------|---------|
| small  | 100   | 1,000    | 3       |
| medium | 1,000 | 10,000   | 5       |
| large  | 5,000 | 50,000   | 5       |

Override individual parameters during generation:

```bash
yarn workspace @lingui/benchmarks generate --preset medium --files 500 --messages-per-file 20 --locales en,fr
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

- **Console**: Visual bar charts with throughput, timing, and comparison ratios
- **JSON**: Machine-readable results at `.results/results.json`

## How Fixtures Work

The benchmark generates a simulated project:
- 50% `.tsx` files with `<Trans>`, `<Plural>`, and `useLingui()` hook (JSX macros)
- 50% `.ts` files with `` t` ` `` and `plural()` (JS macros)
- ~10% of messages are plurals
- ~30% of interpolated messages use complex expressions (`user.name`, `cart.getSubtotal()`)
- ~20% of files use `// lingui-set context="..."` directives
- 10-18% message reuse rate (realistic for a large project)
- Pre-existing PO catalogs generated via real extraction (`lingui extract-template`), with proper `#: file:line` origins
- 90% of messages have translations (simulates mature project with incremental new messages)

## Dependencies

- `tinybench` — benchmarking framework
- `@swc/core` + `@lingui/swc-plugin` — SWC macro transformation
- `lingui-swc` — Rust-based extractor for the CLI
- Workspace packages: `@lingui/cli`, `@lingui/conf`, `@lingui/format-po`, etc.
