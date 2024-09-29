import { createLinguiMetroTransformer } from "../metroTransformer"

// @ts-expect-error the typings that are published with the package actually are not accurate
import expoTransformer from "@expo/metro-config/babel-transformer"

export const transform = createLinguiMetroTransformer(expoTransformer)
