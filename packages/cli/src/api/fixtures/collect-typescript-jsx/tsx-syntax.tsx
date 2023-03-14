const jsx = <div>Hello!</div>

// Typescript syntax
function foo(bar: string): string {
  return bar
}

const test1: string = ""

// check parsing different syntax proposals
@Decorator()
export class TestDecorator {
  @Decorator()
  prop

  @Decorator()
  method() {}
}

// optional chaining
const test = foo?.bar?.baz

class A {
  // classProperties
  b = 1

  // classPrivateProperties
  #b = 1
}

// dynamicImport
import("./guy").then(a)

// exportNamespaceFrom
export * as ns from "mod"

// nullishCoalescingOperator
const a = a ?? b

// objectRestSpread
const b = { b, ...c }

// optionalChaining
const c = a?.b

// topLevelAwait
await promise
