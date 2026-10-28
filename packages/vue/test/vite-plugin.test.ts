import path from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { linguiVue } from "../src/vite"
import { runVite } from "./run-vite"

const fixture = path.resolve(import.meta.dirname, "fixtures/basic")

const alias = {
  // the runtime is resolved from sources so the test doesn't require a build
  "@lingui/vue/macro": path.resolve(import.meta.dirname, "../macro/index.mjs"),
  "@lingui/vue": path.resolve(import.meta.dirname, "../src/index.ts"),
}

const plugins = () => [vue(), linguiVue({ cwd: fixture }), vueJsx()]

const withIds = (messages: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(messages).map(([message, translation]) => [
      generateMessageId(message),
      translation,
    ]),
  )

const csMessages = withIds({
  "Hello <0>{name}</0>, read the <1>docs</1>.":
    "Ahoj <0>{name}</0>, čti <1>dokumentaci</1>.",
  "{count, plural, one {# book} other {# books}}":
    "{count, plural, one {# kniha} few {# knihy} other {# knih}}",
  Search: "Hledat",
  "Hello {name}": "Ahoj {name}",
  "Welcome {0}": "Vítej {0}",
  Bye: "Nashle",
  Hi: "Čau",
  "from TSX": "z TSX",
})

// strip SSR fragment markers
const stripFragments = (html: string) =>
  html.replace(/<!--\[-->|<!--\]-->/g, "")

const expectEnglish = (html: string) => {
  expect(html).toContain(
    `<p id="trans">Hello <b>John</b>, read the <a href="/docs">docs</a>.</p>`,
  )
  expect(html).toContain(`<p id="plural">1 book</p>`)
  expect(html).toContain(`placeholder="Search"`)
  expect(html).toContain(`<p id="t">Hello John</p>`)
  expect(html).toContain(`<p id="script">Welcome John</p>`)
  expect(html).toContain(`<p id="msg">Bye</p>`)
  expect(html).toContain(`<p id="locale">en</p>`)
  expect(html).toContain(`<p id="tsx">Hi from TSX</p>`)
}

const expectCzech = (html: string) => {
  expect(html).toContain(
    `<p id="trans">Ahoj <b>Jane</b>, čti <a href="/docs">dokumentaci</a>.</p>`,
  )
  expect(html).toContain(`<p id="plural">3 knihy</p>`)
  expect(html).toContain(`placeholder="Hledat"`)
  expect(html).toContain(`<p id="t">Ahoj Jane</p>`)
  expect(html).toContain(`<p id="script">Vítej Jane</p>`)
  expect(html).toContain(`<p id="msg">Nashle</p>`)
  expect(html).toContain(`<p id="locale">cs</p>`)
  expect(html).toContain(`<p id="tsx">Čau z TSX</p>`)
}

describe("linguiVue vite plugin", () => {
  it("compiles macros in templates and script setup", async () => {
    const { mod, warn, code } = await runVite("fixtures/basic", plugins(), {
      alias,
    })

    expect(warn).toBe("")
    // client build: templates are compiled to render functions
    expect(code).toContain("createVNode")
    expect(code).not.toContain("ssrRenderComponent")

    expectEnglish(
      stripFragments(await mod.render("en", {}, { name: "John", count: 1 })),
    )
    expectCzech(
      stripFragments(
        await mod.render("cs", csMessages, { name: "Jane", count: 3 }),
      ),
    )
  })

  it("renders through SSR compiled templates and hydrates without mismatch", async () => {
    const server = await runVite("fixtures/basic", plugins(), {
      alias,
      ssr: true,
    })

    expect(server.warn).toBe("")
    // server build: templates are compiled to ssrRender functions
    expect(server.code).toContain("ssrRenderComponent")
    expect(server.code).not.toContain("createElementBlock")

    const html = await server.mod.render("cs", csMessages, {
      name: "Jane",
      count: 3,
    })
    expectCzech(stripFragments(html))

    // hydrate the server markup with a development client build so Vue
    // reports hydration mismatches
    const client = await runVite("fixtures/basic", plugins(), {
      alias,
      mode: "development",
    })

    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (...args: unknown[]) => {
      warnings.push(args.map(String).join(" "))
    }

    try {
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = html

      client.mod.hydrate(container, "cs", csMessages, {
        name: "Jane",
        count: 3,
      })

      expect(warnings.filter((w) => /hydrat|mismatch/i.test(w))).toEqual([])
      expectCzech(stripFragments(container.innerHTML))
      container.remove()
    } finally {
      console.warn = originalWarn
    }
  })

  it("compiles JSX macros when @vitejs/plugin-vue-jsx is registered before linguiVue", async () => {
    // Nuxt registers `vite:vue-jsx` ahead of user plugins
    const { mod, warn } = await runVite(
      "fixtures/basic",
      [vue(), vueJsx(), linguiVue({ cwd: fixture })],
      { alias },
    )

    expect(warn).toBe("")
    expectCzech(
      stripFragments(
        await mod.render("cs", csMessages, { name: "Jane", count: 3 }),
      ),
    )
  })

  it("compiles macros in modules imported with a query", async () => {
    const { mod, warn } = await runVite(
      "fixtures/query",
      [
        linguiVue({
          cwd: path.resolve(import.meta.dirname, "fixtures/query"),
          template: false,
        }),
      ],
      { alias },
    )

    expect(warn).toBe("")
    expect(mod.greeting).toEqual({
      id: generateMessageId("Hello"),
      message: "Hello",
    })
    expect(mod.queried).toEqual(mod.greeting)
    // `?raw` is the source of the file, left as is
    expect(mod.raw).toContain("msg`Hello`")
  })

  it("compiles macros when @vitejs/plugin-vue is registered after linguiVue", async () => {
    const { mod, warn } = await runVite(
      "fixtures/basic",
      [linguiVue({ cwd: fixture }), vue(), vueJsx()],
      { alias },
    )

    expect(warn).toBe("")
    expectCzech(
      stripFragments(
        await mod.render("cs", csMessages, { name: "Jane", count: 3 }),
      ),
    )
  })
})
