/**
 * This is an entry point for React Server Components (RSC)
 *
 * The RSC uses a static analysis to find any non-valid function calls in the import graph.
 * That means this entry point and it's children should not have any Provider/Context calls.
 */
export { TransNoContext } from "./TransNoContext"

export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"
