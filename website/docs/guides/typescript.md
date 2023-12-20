# Typescript

Lingui is written in Typescript and ships with TS typings out of the box. You should not need to do anything to get type support working.

## Macros types in non-React environments

We investigated how macros can be used on Typescript environments where React isn't required.

Now we're shipping two declaration types:

- `index.d.ts` files with `@lingui/core`, `@lingui/react` and `react` as peerDependencies.
- `global.d.ts` files with just `@lingui/core` as peerDependencies.

Now you can modify your `tsconfig.json` in your root directory and reference the global file:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "types": ["./node_modules/@lingui/macro/global"]
  }
}
```
