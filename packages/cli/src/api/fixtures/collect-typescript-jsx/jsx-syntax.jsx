// check parsing different syntax proposals

const jsx = <div>Hello!</div>

@Decorator()
export class TestDecorator {
  @Decorator()
  prop;

  @Decorator()
  method() {};
}

class A {
  // classProperties
  b = 1;

  // classPrivateProperties
  #b = 1;
}

// dynamicImport
import('./guy').then(a)

// exportNamespaceFrom
export * as ns from "mod"

// nullishCoalescingOperator
const a = a ?? b;

// objectRestSpread
const b = { b, ...c };

// optionalChaining
const c = a?.b;

// topLevelAwait
await promise;
