# Typescript

Lingui supports typescript types out of the box since version `3.0.0`.

## Macros types in non-React environments

Since the opening of this issue we investigated that macros can be used on Typescript environments where React isn't required.

Now we're shipping two declaration types:

- `index.d.ts` files with `@lingui/core`, `@lingui/react` and `react` as peerDependencies.
- `global.d.ts` files with just `@lingui/core` as peerDependencies.

Now you can modify your `tsconfig.json` in your root directory and reference the global file:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": [
      "./node_modules/@lingui/macro/global",
    ]
  }
}
```
