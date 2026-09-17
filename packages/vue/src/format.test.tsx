import { mockConsole } from "@lingui/test-utils"
import { mount } from "@vue/test-utils"
import { defineComponent, h, type VNodeChild } from "vue"
import { formatElements } from "./format"

describe("formatElements", function () {
  const toArray = (children: VNodeChild) =>
    Array.isArray(children) ? children : [children]

  const html = (elements: () => VNodeChild) =>
    mount({ render: () => h("div", null, toArray(elements())) }).element
      .innerHTML

  it("should return string when there are no elements", function () {
    expect(formatElements("")).toEqual("")
    expect(formatElements("Text only")).toEqual("Text only")
  })

  it("should format unpaired elements", function () {
    expect(html(() => formatElements("<0/>", { 0: <br /> }))).toEqual("<br>")
  })

  it("should format paired elements", function () {
    expect(
      html(() =>
        formatElements("<0>Inner</0>", {
          0: <strong />,
        }),
      ),
    ).toEqual("<strong>Inner</strong>")

    expect(
      html(() =>
        formatElements("Before <0>Inner</0> After", {
          0: <strong />,
        }),
      ),
    ).toEqual("Before <strong>Inner</strong> After")
  })

  it("should preserve element props", function () {
    expect(
      html(() =>
        formatElements("<0>About</0>", {
          0: <a href="/about" />,
        }),
      ),
    ).toEqual('<a href="/about">About</a>')
  })

  it("should preserve newlines", function () {
    expect(
      html(() =>
        formatElements("<0>Inn\ner</0>", {
          0: <strong />,
        }),
      ),
    ).toEqual("<strong>Inn\ner</strong>")

    expect(
      html(() =>
        formatElements("Before <0>Inn\r\ner</0> After", {
          0: <strong />,
        }),
      ),
    ).toEqual("Before <strong>Inn\r\ner</strong> After")

    expect(
      html(() =>
        formatElements("<0>Ab\rout</0>", {
          0: <a href="/about" />,
        }),
      ),
    ).toEqual('<a href="/about">Ab\rout</a>')
  })

  it("should preserve named element props", function () {
    expect(
      html(() =>
        formatElements("<named>About</named>", {
          named: <a href="/about" />,
        }),
      ),
    ).toEqual('<a href="/about">About</a>')
  })

  it("should preserve nested named element props", function () {
    expect(
      html(() =>
        formatElements("<named>About <b>us</b></named>", {
          named: <a href="/about" />,
          b: <strong />,
        }),
      ),
    ).toBe('<a href="/about">About <strong>us</strong></a>')
  })

  it("should format nested elements", function () {
    expect(
      html(() =>
        formatElements("<0><1>Deep</1></0>", {
          0: <a href="/about" />,
          1: <strong />,
        }),
      ),
    ).toEqual('<a href="/about"><strong>Deep</strong></a>')

    expect(
      html(() =>
        formatElements(
          "Before \n<0>Inside <1>\nNested</1>\n Between <2/> After</0>",
          {
            0: <a href="/about" />,
            1: <strong />,
            2: <br />,
          },
        ),
      ),
    ).toEqual(
      'Before \n<a href="/about">Inside <strong>\nNested</strong>\n Between <br> After</a>',
    )
  })

  it("should accept components and tag names as elements", function () {
    const Link = defineComponent({
      props: { to: { type: String, required: true } },
      setup(props, { slots }) {
        return () => h("a", { href: props.to }, slots.default?.())
      },
    })

    expect(
      html(() =>
        formatElements("<link>the <b>docs</b></link>", {
          link: <Link to="/docs" />,
          b: "strong",
        }),
      ),
    ).toEqual('<a href="/docs">the <strong>docs</strong></a>')

    expect(
      html(() =>
        formatElements("<0>docs</0>", {
          0: (_props: unknown, { slots }: { slots: any }) =>
            h("em", null, slots.default?.()),
        }),
      ),
    ).toEqual("<em>docs</em>")
  })

  it("should warn about children of void elements", function () {
    mockConsole((console) => {
      expect(html(() => formatElements("<0>text</0>", { 0: <br /> }))).toEqual(
        "text",
      )
      expect(console.error).toBeCalledTimes(1)
    })
  })

  it("should ignore non existing element", function () {
    mockConsole((console) => {
      expect(html(() => formatElements("<0>First</0>"))).toEqual("First")
      expect(html(() => formatElements("<0>First</0>Second"))).toEqual(
        "FirstSecond",
      )
      expect(html(() => formatElements("First<0>Second</0>Third"))).toEqual(
        "FirstSecondThird",
      )
      expect(html(() => formatElements("Fir<0/>st"))).toEqual("First")
      expect(html(() => formatElements("<tag>text</tag>"))).toEqual("text")
      expect(html(() => formatElements("text <br/>"))).toEqual("text ")

      expect(console.warn).not.toBeCalled()
      expect(console.error).toBeCalledTimes(6)
    })
  })

  it("should ignore incorrect tags and print them as a text", function () {
    mockConsole((console) => {
      expect(html(() => formatElements("text</0>"))).toEqual("text&lt;/0&gt;")
      expect(html(() => formatElements("text<0 />"))).toEqual("text&lt;0 /&gt;")

      expect(console.warn).not.toBeCalled()
      expect(console.error).not.toBeCalled()
    })
  })

  it("should ignore paired element used as unpaired", function () {
    expect(
      html(() =>
        formatElements("text<0/>", {
          0: <span />,
        }),
      ),
    ).toEqual("text<span></span>")
  })

  it("should ignore paired named element used as unpaired", function () {
    expect(
      html(() =>
        formatElements("text<named/>", {
          named: <span />,
        }),
      ),
    ).toEqual("text<span></span>")
  })

  it("should create two children with distinct DOM nodes", function () {
    const wrapper = mount({
      render: () =>
        h(
          "div",
          null,
          toArray(
            formatElements("<div><0/><0/></div>", {
              div: <div />,
              0: <span>hi</span>,
            }),
          ),
        ),
    })
    const spans = Array.from(
      (wrapper.element as HTMLElement).querySelectorAll("span"),
    )

    expect(spans).toHaveLength(2)
    expect(spans[0]?.textContent).toBe("hi")
    expect(spans[1]?.textContent).toBe("hi")
    expect(spans[0]).not.toBe(spans[1])
  })
})
