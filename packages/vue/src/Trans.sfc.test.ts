import { setupI18n } from "@lingui/core"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { mount } from "@vue/test-utils"
import { createSSRApp, h, nextTick } from "vue"
import { renderToString } from "vue/server-renderer"
import { I18nProvider, createLingui } from "./index"
import Basic from "./fixtures/Basic.vue"
import Scoped from "./fixtures/Scoped.vue"

describe("Trans in SFC templates", () => {
  const messages = {
    "Hello <0>{name}</0>, read the <1>docs</1>.":
      "Ahoj <0>{name}</0>, čti <1>dokumentaci</1>.",
    "{count, plural, one {# book} other {# books}}":
      "{count, plural, one {# kniha} few {# knihy} other {# knih}}",
    "{count, plural, one {One <0>{name}</0> book} other {# books}}":
      "{count, plural, one {Jedna kniha <0>{name}</0>} other {# knih}}",
    Search: "Hledat",
    "Hello {name}": "Ahoj {name}",
    "Item {item}": "Položka {item}",
  }

  const cs = Object.fromEntries(
    Object.entries(messages).map(([message, translation]) => [
      generateMessageId(message),
      translation,
    ]),
  )
  cs["custom.id"] = "Vlastní"

  const i18n = setupI18n({
    locale: "en",
    messages: { en: {}, cs },
  })

  const mountBasic = (props: Record<string, unknown>) =>
    mount({
      render: () =>
        h(I18nProvider, { i18n }, { default: () => h(Basic, props) }),
    })

  it("renders compiled templates with the source language", async () => {
    i18n.activate("en")
    const wrapper = mountBasic({
      name: "John",
      count: 1,
      items: ["a", "b"],
    })

    const html = (testId: string) =>
      wrapper.find(`[data-testid="${testId}"]`).element.innerHTML

    expect(html("trans")).toBe(
      `Hello <b>John</b>, read the <a href="/docs">docs</a>.`,
    )
    expect(html("plural")).toBe("1 book")
    expect(html("rich-plural")).toBe("One <em>John</em> book")
    expect(
      wrapper.find('[data-testid="input"]').attributes("placeholder"),
    ).toBe("Search")
    expect(html("t")).toBe("Hello John")
    expect(wrapper.findAll("li").map((li) => li.text())).toEqual([
      "Item a",
      "Item b",
    ])
    expect(html("custom")).toBe("Custom")
    expect(html("runtime")).toBe("Custom")
    expect(html("locale")).toBe("en")

    const wrapper2 = mountBasic({ name: "Jane", count: 2, items: [] })
    expect(wrapper2.find('[data-testid="plural"]').text()).toBe("2 books")
    expect(wrapper2.find('[data-testid="rich-plural"]').text()).toBe("2 books")
  })

  it("re-renders on locale change", async () => {
    i18n.activate("en")
    const wrapper = mountBasic({ name: "John", count: 3, items: ["a"] })

    const html = (testId: string) =>
      wrapper.find(`[data-testid="${testId}"]`).element.innerHTML

    i18n.activate("cs")
    await nextTick()

    expect(html("trans")).toBe(
      `Ahoj <b>John</b>, čti <a href="/docs">dokumentaci</a>.`,
    )
    expect(html("plural")).toBe("3 knihy")
    expect(
      wrapper.find('[data-testid="input"]').attributes("placeholder"),
    ).toBe("Hledat")
    expect(html("t")).toBe("Ahoj John")
    expect(wrapper.find("li").text()).toBe("Položka a")
    expect(html("custom")).toBe("Vlastní")
    expect(html("runtime")).toBe("Vlastní")
    expect(html("locale")).toBe("cs")

    i18n.activate("en")
  })

  it("keeps scoped CSS ids, directives and refs on paired placeholders", async () => {
    i18n.activate("en")
    const wrapper = mount(Scoped, {
      props: { show: false },
      global: { plugins: [createLingui({ i18n })] },
    })

    const b = wrapper.find("b")
    const i = wrapper.find("i")
    const scopeId = Object.keys(wrapper.find("p").attributes()).find((attr) =>
      attr.startsWith("data-v-"),
    )!

    expect(scopeId).toBeDefined()
    expect(b.attributes()).toHaveProperty(scopeId)
    expect(i.attributes()).toHaveProperty(scopeId)
    expect(b.attributes("style")).toContain("display: none")
    expect((wrapper.vm as unknown as { inner: HTMLElement | null }).inner).toBe(
      i.element,
    )

    await wrapper.setProps({ show: true })
    expect(b.attributes("style") ?? "").not.toContain("display: none")

    const ssrApp = createSSRApp(Scoped, { show: false }).use(
      createLingui({ i18n }),
    )
    const ssr = await renderToString(ssrApp)
    expect(ssr).toContain(
      `<b class="x" style="display:none;" ${scopeId}>world</b>`,
    )
    expect(ssr).toContain(`<i ${scopeId}>ref</i>`)
  })
})
