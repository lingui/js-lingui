import { createLinguiMetroTransformer } from "../metroTransformer"

// @ts-expect-error typings are not published
// eslint-disable-next-line import/no-unresolved
import reactNativeTransformer from "@react-native/metro-babel-transformer"

export const transform = createLinguiMetroTransformer(reactNativeTransformer)
