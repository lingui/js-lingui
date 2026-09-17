import {
  compileTemplate,
  type SFCTemplateCompileOptions,
} from "vue/compiler-sfc"
import {
  linguiTemplateTransform,
  type LinguiTemplateTransformOptions,
} from "./index"

const compile = (
  source: string,
  options: LinguiTemplateTransformOptions = {},
  compilerOptions: SFCTemplateCompileOptions["compilerOptions"] = {},
  extra: Partial<SFCTemplateCompileOptions> = {},
) =>
  compileTemplate({
    source,
    filename: "test.vue",
    id: "test",
    ...extra,
    compilerOptions: {
      bindingMetadata: {
        t: "setup-const",
        name: "setup-ref",
        count: "setup-ref",
        Trans: "setup-const",
      } as SFCTemplateCompileOptions["compilerOptions"] extends {
        bindingMetadata?: infer B
      }
        ? B
        : never,
      ...compilerOptions,
      nodeTransforms: [
        linguiTemplateTransform({ descriptorFields: "all", ...options }),
      ],
    },
  })

const code = (...args: Parameters<typeof compile>) => {
  const result = compile(...args)
  expect(result.errors).toEqual([])
  return result.code
}

const errors = (...args: Parameters<typeof compile>) =>
  compile(...args).errors.map((error) =>
    typeof error === "string" ? error : error.message,
  )

describe("linguiTemplateTransform", () => {
  describe("<Trans>", () => {
    it("compiles text, interpolations and elements", () => {
      expect(
        code(`
          <Trans>
            Hello <b>{{ name }}</b>, read the <a :href="url" @click="go">docs</a>.
          </Trans>
        `),
      ).toMatchSnapshot()
    })

    it("uses positional placeholders for non-identifier expressions and labeled expressions", () => {
      expect(
        code(`
          <Trans>Hello {{ user.name }} and {{ ph({ friend: user.friend }) }} and {{ { age: user.age } }}</Trans>
        `),
      ).toMatchSnapshot()
    })

    it("supports nested elements, comments and string literals", () => {
      expect(
        code(`
          <Trans>
            <!-- a comment -->
            Read <a href="/docs">the <strong>docs</strong> {{ "now" }}</a>
          </Trans>
        `),
      ).toMatchSnapshot()
    })

    it("supports custom id, comment and context", () => {
      expect(
        code(
          `<Trans id="custom.id" comment="Greeting" context="direction">Right</Trans>`,
        ),
      ).toMatchSnapshot()
    })

    it("keeps the other attributes and directives on the element", () => {
      expect(
        code(
          `<Trans class="lead" :render="renderIt" v-if="show" v-for="item in items" :key="item.id">Item {{ item.name }}</Trans>`,
        ),
      ).toMatchSnapshot()
    })

    it("flattens nested <Trans> and inlines nested choice components", () => {
      expect(
        code(`
          <Trans>
            You have <Plural :value="count" one="# message" other="# messages" /> in <Trans>your inbox</Trans>
          </Trans>
        `),
      ).toMatchSnapshot()
    })

    it("supports template literals and t macros inside interpolations", () => {
      expect(
        code(
          "<Trans>{{ `Hello ${name}` }} - {{ t`inner` }} - {{ plural(count, { one: '# book', other: '# books' }) }}</Trans>",
        ),
      ).toMatchSnapshot()
    })

    it("supports placeholder attributes and defaults", () => {
      expect(
        code(
          `<Trans>Read <a _t="docs" href="/docs">the docs</a> or <a _t="blog" href="/blog">the blog</a> <br /></Trans>`,
          {
            placeholderAttribute: "_t",
            placeholderDefaults: { br: "br" },
          },
        ),
      ).toMatchSnapshot()
    })

    it("ignores the attribute injected by vite-plugin-vue-inspector when comparing same-named elements", () => {
      expect(
        errors(
          `<Plural :value="count">
            <template #one><b _t="name" data-v-inspector="App.vue:3:9">{{ name }}</b> file</template>
            <template #other><b _t="name" data-v-inspector="App.vue:4:9">{{ name }}</b> files</template>
          </Plural>`,
          { placeholderAttribute: "_t" },
        ),
      ).toEqual([])
    })

    it("supports kebab-case and lowercase tags", () => {
      expect(
        code(
          `<trans>Hello</trans> <select-ordinal :value="n" one="#st" other="#th" />`,
        ),
      ).toMatchSnapshot()
    })

    it("folds static attributes of runtime usage into a descriptor", () => {
      const output = code(
        `<Trans id="custom.id" message="Hello {name}" comment="Greeting" context="direction" :values="{ name }" />`,
      )
      expect(output).toContain("/** i18n */")
      expect(output).toMatch(/id:"custom\.id"/)
      expect(output).toMatch(/message:"Hello \{name\}"/)
      expect(output).toMatch(/comment:"Greeting"/)
      expect(output).toMatch(/context:"direction"/)
      expect(output).toContain("values: { name: ")
    })

    it("generates an id for runtime usage with only a message", () => {
      expect(code(`<Trans message="Hello" />`)).toMatchSnapshot()
    })

    it("keeps named slots and bound attributes of runtime usage", () => {
      const output = code(`
        <Trans id="link" message="Read <link>Description</link> below." :values="{ name }">
          <template #link><a href="/docs" /></template>
        </Trans>
      `)
      expect(
        errors(`
        <Trans id="link" message="Read <link>Description</link> below.">
          <template #link><a href="/docs" /></template>
        </Trans>
      `),
      ).toEqual([])
      expect(output).toMatch(/id:"link"/)
      expect(output).toContain("link: ")
      expect(output).toContain('href: "/docs"')
    })

    it("leaves runtime usage with dynamic attributes untouched", () => {
      const output = code(
        `<Trans :id="dynamicId" :message="msg" comment="Not folded" />`,
      )
      expect(output).not.toContain("i18n")
      expect(output).toContain(`comment: "Not folded"`)

      // A hashed id would override the dynamic one
      expect(code(`<Trans :id="dynamicId" message="Hello" />`)).not.toContain(
        "i18n",
      )
      expect(code(`<Trans message="Hello" :context="ctx" />`)).not.toContain(
        "i18n",
      )

      // A static id is extracted, the dynamic message stays a runtime prop
      const withId = code(
        `<Trans id="custom.id" :message="msg" comment="Dynamic message" />`,
      )
      expect(withId).toMatch(/id:"custom\.id",comment:"Dynamic message"/)
      expect(withId).toContain("message: ")
      expect(withId).not.toMatch(/i18n \*\/\{[^}]*message:/)
    })

    it("strips the message of runtime usage in production mode", () => {
      const output = code(`<Trans id="custom.id" message="Hello" />`, {
        descriptorFields: "id-only",
      })
      expect(output).toMatch(/id:"custom\.id"/)
      expect(output).not.toContain("Hello")
    })

    it("strips the message in production mode", () => {
      expect(
        code(`<Trans>Hello <b>{{ name }}</b></Trans>`, {
          descriptorFields: "id-only",
        }),
      ).toMatchSnapshot()
    })

    it("keeps message and context but not comment in message mode", () => {
      const output = code(
        `<Trans comment="Greeting" context="direction">Right</Trans>`,
        { descriptorFields: "message" },
      )
      expect(output).toMatch(/context:\s*"direction"/)
      expect(output).toMatch(/message:\s*"Right"/)
      expect(output).not.toContain("Greeting")
    })

    it("compiles for SSR", () => {
      expect(
        code(`<Trans>Hello <b>{{ name }}</b></Trans>`, {}, {}, { ssr: true }),
      ).toMatchSnapshot()
    })

    it("reports errors for unsupported usage", () => {
      expect(errors(`<Trans>Hello <b v-if="show">{{ name }}</b></Trans>`))
        .toMatchInlineSnapshot(`
        [
          "[lingui] Structural directives (v-if, v-for, v-slot) can't be used on elements inside <Trans>. Move the condition or loop outside of the message.",
        ]
      `)

      expect(errors(`<Trans :id="dynamicId">Hello</Trans>`))
        .toMatchInlineSnapshot(`
        [
          "[lingui] The \`id\` attribute of <Trans> must be a static string",
        ]
      `)

      expect(errors(`<Trans>Hello <slot /></Trans>`)).toMatchInlineSnapshot(`
        [
          "[lingui] <slot> can't be used inside <Trans>. Move it outside of the message.",
        ]
      `)

      expect(errors(`<Trans>  </Trans>`)).toMatchInlineSnapshot(`[]`)

      // Reported by Vue itself (>= 3.4 pre-parses expressions) or by the transform
      expect(errors(`<Trans>{{ a +* b }}</Trans>`)[0]).toMatch(/pars/i)
    })
  })

  describe("choice components", () => {
    it("compiles <Plural> with static and bound attributes", () => {
      expect(
        code(
          `<Plural :value="count" offset="1" _0="No books" one="# book" other="# books" :_1="'One book'" />`,
        ),
      ).toMatchSnapshot()
    })

    it("compiles <Select> and <SelectOrdinal>", () => {
      expect(
        code(`
          <Select :value="gender" _male="His book" _female="Her book" other="Their book" />
          <SelectOrdinal :value="{ position: user.rank }" one="#st" two="#nd" few="#rd" other="#th" />
        `),
      ).toMatchSnapshot()
    })

    it("supports rich choice forms through named slots", () => {
      expect(
        code(`
          <Plural :value="count" other="# books">
            <template #one>One <b>{{ name }}</b> book</template>
            <template #_0>No books, <em>{{ name }}</em></template>
          </Plural>
        `),
      ).toMatchSnapshot()
    })

    it("compiles choice components with a bound `other` attribute", () => {
      expect(
        code(`<Plural :value="count" one="# book" :other="otherLabel" />`),
      ).toMatchSnapshot()
    })

    it("leaves components without the `other` attribute untouched", () => {
      const output = code(`<Select :value="selected" :options="options" />`)
      expect(output).not.toContain("i18n")
    })

    it("reports errors for missing value", () => {
      expect(errors(`<Plural one="# book" other="# books" />`))
        .toMatchInlineSnapshot(`
        [
          "[lingui] <Plural> requires a \`value\` attribute",
        ]
      `)
    })
  })

  describe("t macro in expressions", () => {
    it("compiles tagged templates in interpolations and attributes", () => {
      expect(
        code(
          '<input :placeholder="t`Search`" :title="t`Hello ${name}`" /><p>{{ t`Hello ${user.name}` }}</p>',
        ),
      ).toMatchSnapshot()
    })

    it("compiles nested macros and labeled expressions", () => {
      // `${{ author: user.name }}` can't be used inside `{{ }}`: the closing
      // braces would end the interpolation, use `ph()` instead.
      expect(
        code(
          "<p>{{ t`${plural(count, { one: '# book', other: '# books' })} by ${ph({ author: user.name })}` }}</p>",
        ),
      ).toMatchSnapshot()

      expect(
        code(
          "<p :title=\"t`${select(gender, { male: 'his', other: 'their' })} book by ${{ author: user.name }}`\" />",
        ),
      ).toMatchSnapshot()
    })

    it("compiles descriptor calls", () => {
      expect(
        code(
          "<p>{{ t({ message: `Hello ${name}`, comment: 'Greeting', context: 'direction' }) }}{{ t({ id: 'my.id', values: { name } }) }}</p>",
        ),
      ).toMatchSnapshot()
    })

    it("compiles macros in v-for sources", () => {
      expect(
        code(
          '<li v-for="(label, i) in [t`Daily`, t`Weekly`]" :key="i">{{ label }}</li>',
        ),
      ).toMatchSnapshot()
    })

    it("compiles macros in props of macro elements", () => {
      expect(
        code(
          '<Trans :title="t`Tooltip`" @click="toast = t`Clicked`" v-for="item in [t`A`]" :key="item">Hello</Trans><Plural :value="count" one="Book" other="Books" :title="t`Count`" />',
        ),
      ).toMatchSnapshot()
    })

    it("compiles macros in v-on handlers", () => {
      expect(
        code(
          '<button @click="toast = t`Saved`" @focus="log(t`Focus`); toast = t`Hello ${name}`" />',
        ),
      ).toMatchSnapshot()
    })

    it("supports custom macro names", () => {
      expect(
        code("<p>{{ $t`Hello ${name}` }}</p>", { macroNames: { t: "$t" } }),
      ).toMatchSnapshot()
    })

    it("ignores member expressions and unrelated identifiers", () => {
      const output = code("<p>{{ obj.t`x` }} {{ tt`y` }} {{ t(value) }}</p>")
      expect(output).not.toContain("i18n")
    })

    it("leaves descriptor calls without `id` or `message` untouched", () => {
      // e.g. `t` of another i18n library, or a user-defined `t`
      const output = code(
        "<p>{{ t({ path: 'x' }) }} {{ t({ values: { name } }) }}</p>",
      )
      expect(output).not.toContain("i18n")
      expect(output).toContain("path: 'x'")
    })

    it("reports an error for descriptors with a dynamic message", () => {
      expect(errors("<p>{{ t({ message: k }) }}</p>")).toMatchInlineSnapshot(`
        [
          "[lingui] Unsupported macro usage: The \`message\` of a descriptor must be a string literal, a template literal or a macro call",
        ]
      `)

      expect(errors("<p>{{ t({ id: 'x', message: user.name }) }}</p>"))
        .toMatchInlineSnapshot(`
        [
          "[lingui] Unsupported macro usage: The \`message\` of a descriptor must be a string literal, a template literal or a macro call",
        ]
      `)
    })

    it("reports an error instead of crashing on unsupported macro calls", () => {
      expect(errors("<p>{{ t`Books: ${ph(count)}` }}</p>"))
        .toMatchInlineSnapshot(`
        [
          "[lingui] Unsupported macro usage: Incorrect usage of \`ph\` macro. First argument should be an ObjectExpression",
        ]
      `)
    })

    it("handles expressions with TypeScript syntax", () => {
      expect(
        code(
          "<p>{{ t`Hello ${(user as any).name!}` }}</p>",
          {},
          { isTS: true, expressionPlugins: ["typescript"] },
        ),
      ).toMatchSnapshot()
    })
  })
})
