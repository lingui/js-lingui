// Flow is missing definition for forwardRef.
// I don't know better solution than re:export it from different module,
// which isn't checked by flow.
// https://github.com/facebook/flow/issues/6103
export { forwardRef } from "react"
