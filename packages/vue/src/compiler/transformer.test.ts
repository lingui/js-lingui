import { run } from "../test/utils"

describe("transformTrans", () => {
  it("should transform a Trans component to runtime Trans call with id & message", () => {
    const { code } = run(`<Trans>This is some random content</Trans>`)

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "cr8mms",
        message: "This is some random content"
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should transform a Trans component to runtime Trans call with id & message & context", () => {
    const { code } = run(
      `
      <Trans context="direction">right</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "d1wX4r",
        message: "right",
        context: "direction"
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should normalize whitespaces", () => {
    const { code } = run(
      `
      <Trans>
      right
      </Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "lpXHCY",
        message: " right "
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should transform with given id", () => {
    const { code } = run(
      `
      <Trans id="random.content">This is some random content</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "random.content",
        message: "This is some random content"
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should transform with values when present", () => {
    const { code } = run(
      `
      <Trans>Hello {{ name }} welcome to {{ town }} you are now a {{ persona }}!</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "cc6wEV",
        message: "Hello {name} welcome to {town} you are now a {persona}!",
        values: {
          name: _ctx.name,
          town: _ctx.town,
          persona: _ctx.persona
        }
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should transform with placeholders when inner tags", () => {
    const { code } = run(
      `
      <Trans>Hello <em>{{ name }}</em> welcome to {{ town }} <br /> <span>you are now <em><i>a {{ persona }}</i></em></span>!</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { resolveDynamicComponent as _resolveDynamicComponent, openBlock as _openBlock, createBlock as _createBlock, createElementVNode as _createElementVNode, normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, withCtx as _withCtx } from "vue"

      const _hoisted_1 = /*#__PURE__*/_createElementVNode("br", null, null, -1 /* HOISTED */)

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "r0tHqI",
        message: "Hello <0>{name}</0> welcome to {town} <1/> <2>you are now <3><4>a {persona}</4></3></2>!",
        values: {
          name: _ctx.name,
          town: _ctx.town,
          persona: _ctx.persona
        }
      })), {
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
        }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */))
      }
    `)
  })

  it("should handle simple quotes", () => {
    const { code } = run(
      `
      <Trans>John's car is red</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "H3I1xb",
        message: "John's car is red"
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should handle double quotes", () => {
    const { code } = run(
      `
      <Trans>This car is "red"</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "HP8WZU",
        message: "This car is \\"red\\""
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should handle mixed quotes", () => {
    const { code } = run(
      `
      <Trans>John's car is "red"</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "dp/IGY",
        message: "John's car is \\"red\\""
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should handle complex interpolation", () => {
    const { code } = run(
      `
      <Trans>Hello {{ user.name }}</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "Y7riaK",
        message: "Hello {0}",
        values: {
          0: _ctx.user.name
        }
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should support Plural as icu", () => {
    const { code } = run(
      `
<Trans>{ {{ arg(count) }}, plural, one {# <em>book</em>} other {# <strong>books</strong>} }</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { resolveDynamicComponent as _resolveDynamicComponent, openBlock as _openBlock, createBlock as _createBlock, createElementVNode as _createElementVNode, normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, withCtx as _withCtx } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "fMz2/F",
        message: "{ count, plural, one {# <0>book</0>} other {# <1>books</1>} }",
        values: {
          count: _ctx.count
        }
      })), {
          [0]: _withCtx(({children}) => [
            _createElementVNode("em", null, [
              (_openBlock(), _createBlock(_resolveDynamicComponent(children)))
            ])
          ]),
          [1]: _withCtx(({children}) => [
            _createElementVNode("strong", null, [
              (_openBlock(), _createBlock(_resolveDynamicComponent(children)))
            ])
          ]),
          _: 2 /* DYNAMIC */
        }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */))
      }
    `)
  })

  it("should support js plural inside of Trans", () => {
    const { code } = run(
      `
<Trans>
 You have {{plural(count, {one: "# book", other: "# books"})}}
</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "8GTfFt",
        message: " You have {count, plural, one {# book} other {# books}}",
        values: {
          count: _ctx.count
        }
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })

  it("should handle multiple complex interpolation", () => {
    const { code } = run(
      `
      <Trans>Hello {{ user.name }}! Do you love {{ isCatPerson ? "cat" : "dogs" }}?</Trans>
    `
    )

    expect(code).toMatchInlineSnapshot(`
      import { normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createBlock($setup["Trans"], _normalizeProps(_guardReactiveProps(/*i18n*/
      {
        id: "EtDOPn",
        message: "Hello {0}! Do you love {1}?",
        values: {
          0: _ctx.user.name,
          1: _ctx.isCatPerson ? "cat" : "dogs"
        }
      })), null, 16 /* FULL_PROPS */))
      }
    `)
  })
})

describe("transform vt", () => {
  it("should transform t macro in props", () => {
    const { code } = run('<img :title="vt`Hello ${name}`" src="" />')

    expect(code).toMatchInlineSnapshot(`
      import { openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

      const _hoisted_1 = ["title"]

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createElementBlock("img", {
          title: _ctx.vt._(
      /*i18n*/
      {
        id: "OVaF9k",
        message: "Hello {name}",
        values: {
          name: _ctx.name
        }
      }),
          src: ""
        }, null, 8 /* PROPS */, _hoisted_1))
      }
    `)
  })

  it("should transform t macro in interpolation", () => {
    const { code } = run("<div>{{ vt`Hello ${name}` }}</div>")

    expect(code).toMatchInlineSnapshot(`
      import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.vt._(
      /*i18n*/
      {
        id: "OVaF9k",
        message: "Hello {name}",
        values: {
          name: _ctx.name
        }
      })), 1 /* TEXT */))
      }
    `)
  })

  it("should transform t macro with message descriptor", () => {
    const { code } = run(
      '<img :title="vt({message: `Hello`, context: `i am a context`})" src="" />'
    )

    expect(code).toMatchInlineSnapshot(`
      import { openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

      const _hoisted_1 = ["title"]

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createElementBlock("img", {
          title: _ctx.vt._(
      /*i18n*/
      {
        id: "16G7ph",
        message: "Hello",
        context: \`i am a context\`
      }),
          src: ""
        }, null, 8 /* PROPS */, _hoisted_1))
      }
    `)
  })

  it("should support plural", () => {
    const { code } = run(
      `<img :title="plural(users.length, {
          offset: 1,
          0: 'No books',
          1: '1 book',
          other: '# books'
        })" src="" />`
    )

    expect(code).toMatchInlineSnapshot(`
      import { openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

      const _hoisted_1 = ["title"]

      export function render(_ctx, _cache, $props, $setup, $data, $options) {
        return (_openBlock(), _createElementBlock("img", {
          title: _ctx.vt._(
      /*i18n*/
      {
        id: "CF5t+7",
        message: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
        values: {
          0: _ctx.users.length
        }
      }),
          src: ""
        }, null, 8 /* PROPS */, _hoisted_1))
      }
    `)
  })
})
