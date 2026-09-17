import { describe, it, expect, beforeEach, vi } from "vitest"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { type I18n, setupI18n } from "@lingui/core"
import { I18nProvider } from "@lingui/vue"
import App from "./App.vue"
import { loadCatalog } from "./i18n"

describe("App", () => {
  let i18n: I18n
  let wrapper: VueWrapper

  const find = (testId: string) => wrapper.find(`[data-testid="${testId}"]`)

  const switchLocale = async (name: string, locale: string) => {
    await wrapper
      .findAll("button")
      .find((button) => button.text() === name)!
      .trigger("click")
    // the catalog is loaded with a dynamic import, wait for the activation
    await vi.waitFor(() => expect(i18n.locale).toBe(locale))
    await flushPromises()
    await nextTick()
  }

  beforeEach(async () => {
    i18n = setupI18n()
    await loadCatalog("en", i18n)

    wrapper = mount({
      render: () => h(I18nProvider, { i18n }, { default: () => h(App) }),
    })
  })

  it("Should render default messages in english and handle language switching", async () => {
    expect(find("edit-text").text()).toBe(
      "Edit src/App.vue and save to test HMR",
    )
    expect(find("edit-text").element.innerHTML).toBe(
      "Edit <code>src/App.vue</code> and save to test HMR",
    )

    await switchLocale("Polish", "pl")

    expect(find("edit-text").text()).toBe(
      "Edytuj src/App.vue i zapisz, aby przetestować HMR",
    )
  })

  it("Should render plural message in EN", async () => {
    const pluralBtn = find("plural-button")

    expect(pluralBtn.text()).toMatchInlineSnapshot(`"0 months"`)

    await pluralBtn.trigger("click")
    expect(pluralBtn.text()).toMatchInlineSnapshot(`"1 month"`)

    await pluralBtn.trigger("click")
    expect(pluralBtn.text()).toMatchInlineSnapshot(`"2 months"`)
  })

  it("Should render plural message in PL", async () => {
    await switchLocale("Polish", "pl")

    const pluralBtn = find("plural-button")

    expect(pluralBtn.text()).toMatchInlineSnapshot(`"0 miesięcy"`)

    await pluralBtn.trigger("click")
    expect(pluralBtn.text()).toMatchInlineSnapshot(`"1 miesiąc"`)

    await pluralBtn.trigger("click")
    expect(pluralBtn.text()).toMatchInlineSnapshot(`"2 miesiące"`)

    await pluralBtn.trigger("click")
    await pluralBtn.trigger("click")
    await pluralBtn.trigger("click")
    expect(pluralBtn.text()).toMatchInlineSnapshot(`"5 miesięcy"`)
  })

  it("Should render using `t` in a template attribute", async () => {
    const pluralBtn = find("plural-button")

    expect(pluralBtn.attributes("title")).toBe(
      "Click on this button to test plurals",
    )

    await switchLocale("Polish", "pl")

    expect(pluralBtn.attributes("title")).toBe(
      "Kliknij ten przycisk, aby przetestować formy liczby mnogiej",
    )
  })

  it("Should render lazy messages and `t` from the JSX macro", async () => {
    const msgExampleEl = find("msg-example")

    expect(msgExampleEl.text()).toMatchInlineSnapshot(`"Red Blue Orange"`)

    await switchLocale("Polish", "pl")

    expect(msgExampleEl.text()).toBe("Czerwony Niebieski Pomarańczowy")
  })

  it("Should render select message and react to the selected value", async () => {
    const message = find("select-message")
    const select = find("gender-select")

    expect(message.text()).toBe("His inbox")

    await select.setValue("female")
    expect(message.text()).toBe("Her inbox")

    await select.setValue("other")
    expect(message.text()).toBe("Their inbox")

    await switchLocale("Polish", "pl")

    expect(message.text()).toBe("Ich skrzynka")
    expect(find("select-example").text()).toContain("Czyja skrzynka?")

    await select.setValue("male")
    expect(message.text()).toBe("Jego skrzynka")
  })
})
