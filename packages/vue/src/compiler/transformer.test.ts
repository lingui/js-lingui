import { run } from "../test/utils"
import { transformTrans } from "./transformer"

//

describe("transformTrans", () => {
  it("should transform a Trans component to runtime Trans call with id & message", () => {
    const { code } = run(
      `
      <Trans>This is some random content</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "cr8mms",
      message: "This is some random content"
    })
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should transform a Trans component to runtime Trans call with id & message & context", () => {
    const { code } = run(
      `
      <Trans context="direction">right</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "d1wX4r",
      message: "right",
      context: "direction"
    })
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should transform with given id", () => {
    const { code } = run(
      `
      <Trans id="random.content">This is some random content</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "random.content",
      message: "This is some random content"
    })
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should transform with values when present", () => {
    const { code } = run(
      `
      <Trans>Hello {{ name }} welcome to {{ town }} you are now a {{ persona }}!</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "cc6wEV",
      message: "Hello {name} welcome to {town} you are now a {persona}!",
      values: {name: (_ctx.name), town: (_ctx.town), persona: (_ctx.persona)}
    }, null, 8 /* PROPS */, ["values"])
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should transform with placeholders when inner tags", () => {
    const { code } = run(
      `
      <Trans>Hello <em>{{ name }}</em> welcome to {{ town }} <br /> <span>you are now <em><i>a {{ persona }}</i></em></span>!</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveDynamicComponent as _resolveDynamicComponent, openBlock as _openBlock, createBlock as _createBlock, createElementVNode as _createElementVNode, resolveComponent as _resolveComponent, withCtx as _withCtx, createVNode as _createVNode, createElementBlock as _createElementBlock } from "vue"

const _hoisted_1 = /*#__PURE__*/_createElementVNode("br", null, null, -1 /* HOISTED */)

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "r0tHqI",
      message: "Hello <0>{name}</0> welcome to {town} <1/> <2>you are now <3><4>a {persona}</4></3></2>!",
      values: {name: (_ctx.name), town: (_ctx.town), persona: (_ctx.persona)}
    }, {
      [0]: _withCtx(({children}) => [
        _createElementVNode("em", null, [
          (_openBlock(), _createBlock(_resolveDynamicComponent(children)))
        ])
      ]),
      [1]: _withCtx(({children}) => [
        _hoisted_1
      ]),
      [2]: _withCtx(({children}) => [
        _createElementVNode("span", null, [
          (_openBlock(), _createBlock(_resolveDynamicComponent(children)))
        ])
      ]),
      [3]: _withCtx(({children}) => [
        _createElementVNode("em", null, [
          (_openBlock(), _createBlock(_resolveDynamicComponent(children)))
        ])
      ]),
      [4]: _withCtx(({children}) => [
        _createElementVNode("i", null, [
          (_openBlock(), _createBlock(_resolveDynamicComponent(children)))
        ])
      ]),
      _: 2 /* DYNAMIC */
    }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["values"])
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should handle simple quotes", () => {
    const { code } = run(
      `
      <Trans>John's car is red</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "H3I1xb",
      message: "John's car is red"
    })
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should handle double quotes", () => {
    const { code } = run(
      `
      <Trans>This car is "red"</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "HP8WZU",
      message: "This car is \\"red\\""
    })
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should handle mixed quotes", () => {
    const { code } = run(
      `
      <Trans>John's car is "red"</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "dp/IGY",
      message: "John's car is \\"red\\""
    })
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should handle complex interpolation", () => {
    const { code } = run(
      `
      <Trans>Hello {{ user.name }}</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "Y7riaK",
      message: "Hello {0}",
      values: {0: (_ctx.user.name)}
    }, null, 8 /* PROPS */, ["values"])
  ]))
}`

    expect(code).toEqual(result)
  })

  it("should handle multiple complex interpolation", () => {
    const { code } = run(
      `
      <Trans>Hello {{ user.name }}! Do you love {{ isCatPerson ? "cat" : "dogs" }}?</Trans>
    `,
      transformTrans
    )

    const result = `import { resolveComponent as _resolveComponent, createVNode as _createVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  const _component_Trans = _resolveComponent("Trans")

  return (_openBlock(), _createElementBlock("template", null, [
    _createVNode(_component_Trans, {
      id: "EtDOPn",
      message: "Hello {0}! Do you love {1}?",
      values: {0: (_ctx.user.name), 1: (_ctx.isCatPerson ? "cat" : "dogs")}
    }, null, 8 /* PROPS */, ["values"])
  ]))
}`

    expect(code).toEqual(result)
  })
})
