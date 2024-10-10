import { createLinguiMetroTransformer } from "../metroTransformer"

// @ts-expect-error typings are not published
import expoTransformer from "@expo/metro-config/babel-transformer"

export const transform = createLinguiMetroTransformer(expoTransformer)
