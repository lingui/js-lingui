export { default } from "./webpackLoader"

export function remoteLoader() {
  console.error(`
    DEPRECATED: { remoteLoader } from "@lingui/loader"
    Use instead: { remoteLoader } from "@lingui/remote-loader"
  `);
}