import { createLinguiMetroTransformer } from "../metroTransformer"

const expoTransformer = require("@expo/metro-config/babel-transformer")

export const transform = createLinguiMetroTransformer(expoTransformer)
