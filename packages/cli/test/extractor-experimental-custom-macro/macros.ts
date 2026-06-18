// A local barrel that re-exports the Lingui macros, imported by app code
// through the `#macros` subpath. Files importing from here must still be picked
// up by the experimental extractor when the package is listed in
// `macro.corePackage` / `macro.jsxPackage`.
export * from "@lingui/core/macro"
export * from "@lingui/react/macro"
