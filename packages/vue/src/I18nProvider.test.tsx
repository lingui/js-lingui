import { I18n, setupI18n } from "@lingui/core"
import { mount } from "@vue/test-utils"
import { computed, defineComponent, h, nextTick, type PropType } from "vue"
import { I18nProvider, useLingui } from "./I18nProvider"
import { Trans } from "./Trans"
import { createLingui } from "./plugin"

describe("I18nProvider", () => {
  it(
    "should pass i18n context to wrapped components, " +
      "and update computations that consume the context through useLingui()",
    async () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: {},
          cs: {},
        },
      })
      let staticRenderCount = 0
      let dynamicRenderCount = 0

      const WithoutLinguiHook = defineComponent({
        props: { i18n: { type: Object as PropType<I18n>, required: true } },
        setup(props) {
          return () => {
            staticRenderCount++
            return <div data-testid="static">{props.i18n.locale}</div>
          }
        },
      })

      const WithLinguiHook = defineComponent({
        setup() {
          const { i18n } = useLingui()
          const locale = computed(() => {
            dynamicRenderCount++
            return i18n.value.locale
          })

          return () => <div data-testid="dynamic">{locale.value}</div>
        },
      })

      const wrapper = mount(() => (
        <I18nProvider i18n={i18n}>
          <WithoutLinguiHook i18n={i18n} />
          <WithLinguiHook />
        </I18nProvider>
      ))

      const getText = (testId: string) =>
        wrapper.find(`[data-testid="${testId}"]`).text()

      i18n.activate("cs")
      await nextTick()

      expect(getText("static")).toEqual("en")
      expect(getText("dynamic")).toEqual("cs")

      i18n.activate("en")
      await nextTick()

      expect(getText("static")).toEqual("en")
      expect(getText("dynamic")).toEqual("en")
      expect(staticRenderCount).toEqual(1)
      expect(dynamicRenderCount).toEqual(3) // initial, cs, en
    },
  )

  it("should subscribe for locale changes upon mount", () => {
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })
    i18n.on = vi.fn(() => vi.fn())

    expect(i18n.on).not.toBeCalled()
    mount(() => (
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    ))
    expect(i18n.on).toBeCalledWith("change", expect.any(Function))
  })

  it("should unsubscribe for locale changes on unmount", () => {
    const unsubscribe = vi.fn()
    const i18n = setupI18n({
      locale: "cs",
      messages: {
        cs: {},
      },
    })
    i18n.on = vi.fn(() => unsubscribe)

    const wrapper = mount(() => (
      <I18nProvider i18n={i18n}>
        <div />
      </I18nProvider>
    ))
    expect(unsubscribe).not.toBeCalled()
    wrapper.unmount()
    expect(unsubscribe).toBeCalled()
  })

  it("I18nProvider renders `null` until locale is activated. Children are rendered after activation.", async () => {
    expect.assertions(3)

    const i18n = setupI18n()

    const CurrentLocaleStatic = () => {
      return <span data-testid="static">1_{i18n.locale}</span>
    }
    const CurrentLocaleContextConsumer = defineComponent({
      setup() {
        const { i18n } = useLingui()
        return () => <span data-testid="dynamic">2_{i18n.value.locale}</span>
      },
    })

    const wrapper = mount(() => (
      <div>
        <I18nProvider i18n={i18n}>
          <CurrentLocaleStatic />
          <CurrentLocaleContextConsumer />
        </I18nProvider>
      </div>
    ))

    // First render — locale isn't activated
    expect(wrapper.element.textContent).toEqual("")

    i18n.load("cs", {})
    await nextTick()
    // Catalog is loaded, but locale still isn't activated.
    expect(wrapper.element.textContent).toEqual("")

    i18n.activate("cs")
    await nextTick()
    // After loading and activating locale, components are rendered for the first time
    expect(wrapper.element.textContent).toEqual("1_cs2_cs")
  })

  it("does not re-render its slot on i18n changes that keep the locale active (e.g. `load()`)", async () => {
    const i18n = setupI18n({ locale: "en", messages: { en: {} } })

    const slotRenders = vi.fn()
    const consumerRenders = vi.fn()

    const Consumer = defineComponent({
      setup() {
        const { i18n } = useLingui()
        return () => {
          consumerRenders()
          return <span data-testid="locale">{i18n.value.locale}</span>
        }
      },
    })

    mount(() =>
      h(
        I18nProvider,
        { i18n },
        {
          default: () => {
            slotRenders()
            return h(Consumer)
          },
        },
      ),
    )

    expect(slotRenders).toHaveBeenCalledTimes(1)
    expect(consumerRenders).toHaveBeenCalledTimes(1)

    // Loading a catalog for a non-active locale emits "change" but must not
    // re-run the provider's slot. Consumers tracking `i18n` still update.
    i18n.load("cs", {})
    await nextTick()
    expect(slotRenders).toHaveBeenCalledTimes(1)
    expect(consumerRenders).toHaveBeenCalledTimes(2)

    i18n.activate("cs")
    await nextTick()
    expect(slotRenders).toHaveBeenCalledTimes(1)
    expect(consumerRenders).toHaveBeenCalledTimes(3)
  })

  it(
    "given 'en' locale, if activate('cs') call happens before i18n.on-change subscription, " +
      "I18nProvider detects that it's stale and renders with the 'cs' locale value",
    () => {
      const i18n = setupI18n({
        locale: "en",
        messages: { en: {} },
      })

      const CurrentLocaleContextConsumer = defineComponent({
        setup() {
          const { i18n } = useLingui()
          const locale = computed(() => i18n.value.locale)

          return () => <span data-testid="child">{locale.value}</span>
        },
      })

      /**
       * To simulate the situation, we pass our own mock subscriber
       * to i18n.on("change", ...) and in it we call i18n.activate("cs") ourselves
       */
      const mockSubscriber = vi.fn(() => {
        i18n.load("cs", {})
        i18n.activate("cs")
        return () => {
          // unsubscriber - noop to make TS happy
        }
      })
      vi.spyOn(i18n, "on").mockImplementation(mockSubscriber)

      const wrapper = mount(() => (
        <I18nProvider i18n={i18n}>
          <CurrentLocaleContextConsumer />
        </I18nProvider>
      ))

      expect(mockSubscriber).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
      expect(wrapper.find('[data-testid="child"]').text()).toBe("cs")
    },
  )

  it("should render children", () => {
    const i18n = setupI18n({
      locale: "en",
      messages: { en: {} },
    })

    const wrapper = mount(() => (
      <I18nProvider i18n={i18n}>
        <div data-testid="child" />
      </I18nProvider>
    ))
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true)
  })

  it("using the _ function from useLingui renders fresh translations even when memoized", async () => {
    const greetingId = "greeting"
    const i18n = setupI18n({
      locale: "en",
      messages: {
        en: {
          [greetingId]: "Hello World",
        },
        cs: {
          [greetingId]: "Ahoj světe",
        },
      },
    })

    const ComponentWithMemo = defineComponent({
      setup() {
        const { _ } = useLingui()
        const message = computed(() => _(greetingId))
        return () => <div>{message.value}</div>
      },
    })

    const wrapper = mount(() => (
      <I18nProvider i18n={i18n}>
        <ComponentWithMemo />
      </I18nProvider>
    ))

    expect(wrapper.text()).toBe("Hello World")

    i18n.activate("cs")
    await nextTick()

    expect(wrapper.text()).toBe("Ahoj světe")
  })

  it("exposes `t` as a reactive alias of `_` for compiled templates", async () => {
    const i18n = setupI18n({
      locale: "en",
      messages: {
        en: { greeting: "Hello {name}" },
        cs: { greeting: "Ahoj {name}" },
      },
    })

    const Component = defineComponent({
      setup() {
        const { t } = useLingui()
        return () => (
          <div>{t({ id: "greeting", values: { name: "World" } })}</div>
        )
      },
    })

    const wrapper = mount(() => (
      <I18nProvider i18n={i18n}>
        <Component />
      </I18nProvider>
    ))

    expect(wrapper.text()).toBe("Hello World")

    i18n.activate("cs")
    await nextTick()

    expect(wrapper.text()).toBe("Ahoj World")
  })

  it("keeps memoized useLingui().i18n locale in sync on locale change", async () => {
    const i18n = setupI18n({
      locale: "en",
      messages: {
        en: {},
        cs: {},
      },
    })

    const ComponentWithMemoizedI18n = defineComponent({
      setup() {
        const { i18n } = useLingui()
        const getLocale = (i18nInstance: I18n) => i18nInstance.locale
        const currentLocale = computed(() => getLocale(i18n.value))

        return () => <div data-testid="locale">{currentLocale.value}</div>
      },
    })

    const wrapper = mount(() => (
      <I18nProvider i18n={i18n}>
        <ComponentWithMemoizedI18n />
      </I18nProvider>
    ))

    expect(wrapper.find('[data-testid="locale"]').text()).toBe("en")

    i18n.activate("cs")
    await nextTick()

    expect(wrapper.find('[data-testid="locale"]').text()).toBe("cs")
  })

  it("re-subscribes when the i18n instance changes", async () => {
    const first = setupI18n({ locale: "en", messages: { en: { id: "one" } } })
    const second = setupI18n({ locale: "en", messages: { en: { id: "two" } } })

    const Consumer = defineComponent({
      setup() {
        const { _ } = useLingui()
        return () => <span>{_("id")}</span>
      },
    })

    const wrapper = mount(
      defineComponent({
        props: { i18n: { type: Object as PropType<I18n>, required: true } },
        setup(props) {
          return () => (
            <I18nProvider i18n={props.i18n}>
              <Consumer />
            </I18nProvider>
          )
        },
      }),
      { props: { i18n: first } },
    )

    expect(wrapper.text()).toBe("one")

    await wrapper.setProps({ i18n: second })

    expect(wrapper.text()).toBe("two")
  })

  describe("createLingui plugin", () => {
    it("provides the context to the application", async () => {
      const i18n = setupI18n({
        locale: "en",
        messages: {
          en: { greeting: "Hello" },
          cs: { greeting: "Ahoj" },
        },
      })

      const Consumer = defineComponent({
        setup() {
          const { _ } = useLingui()
          return () =>
            h("div", [h("span", _("greeting")), h(Trans, { id: "greeting" })])
        },
      })

      const wrapper = mount(Consumer, {
        global: { plugins: [createLingui({ i18n })] },
      })

      expect(wrapper.text()).toBe("HelloHello")

      i18n.activate("cs")
      await nextTick()

      expect(wrapper.text()).toBe("AhojAhoj")
    })

    it("unsubscribes from i18n changes when the app is unmounted", () => {
      const i18n = setupI18n({ locale: "en", messages: { en: {}, cs: {} } })
      const removeListener = vi.spyOn(i18n, "removeListener")

      const wrapper = mount(defineComponent({ render: () => h("div") }), {
        global: { plugins: [createLingui({ i18n })] },
      })

      expect(removeListener).not.toHaveBeenCalled()

      wrapper.unmount()

      expect(removeListener).toHaveBeenCalledTimes(1)
      expect(removeListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      )
    })
  })
})
