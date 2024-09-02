import { createLinguiMetroTransformer } from "../metroTransformer"

const reactNativeTransformer = (() => {
  try {
    return require("@react-native/metro-babel-transformer")
  } catch (error) {
    return require("metro-react-native-babel-transformer")
  }
})()

export const transform = createLinguiMetroTransformer(reactNativeTransformer)
