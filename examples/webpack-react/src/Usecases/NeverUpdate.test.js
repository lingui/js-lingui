// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider, setupI18n } from "@lingui/react"

import NeverUpdate from "./NeverUpdate"
import Children from "./Children"
import ElementAttributes from "./ElementAttributes"

describe("NeverUpdate", function() {
  const mountWithI18n = WrappedComponent => {
    const i18n = setupI18n({
      locale: "en",
      catalogs: {
        en: {},
        cs: {
          messages: {
            "Full content of {articleName}": "Celý článek {articleName}",
            Close: "Zavřít",
            "msg.label": "Nápis",
            "Hello World": "Ahoj světe",
            "My name is {name}": "Jmenuji se {name}",
            "Read <0>more</0>": "Číst <0>dále</0>"
          }
        }
      }
    })

    return {
      i18n,
      node: mount(
        <I18nProvider i18n={i18n}>
          <NeverUpdate>
            <WrappedComponent />
          </NeverUpdate>
        </I18nProvider>
      )
    }
  }

  const text = (node, element) => {
    return node
      .find(element)
      .first()
      .text()
  }

  it("should update translation of children when locale changes", function() {
    const { node, i18n } = mountWithI18n(Children)

    expect(text(node, ".untranslated")).toEqual("This isn't translated")
    expect(text(node, ".customId")).toEqual("msg.label")
    expect(text(node, ".translated")).toEqual("Hello World")
    expect(text(node, ".variable")).toEqual("My name is Mononoke")

    i18n.activate("cs")
    expect(text(node, ".untranslated")).toEqual("This isn't translated")
    expect(text(node, ".customId")).toEqual("Nápis")
    expect(text(node, ".translated")).toEqual("Ahoj světe")
    expect(text(node, ".variable")).toEqual("Jmenuji se Mononoke")
  })

  it("should update translation of attributes when locale changes", function() {
    const { node, i18n } = mountWithI18n(ElementAttributes)

    expect(node.find(".expression").prop("title")).toEqual(
      "Full content of Scientific Journal"
    )
    expect(node.find(".variable").prop("aria-label")).toEqual("Close")

    i18n.activate("cs")
    node.update()
    expect(node.find(".expression").prop("title")).toEqual(
      "Celý článek Scientific Journal"
    )
    expect(node.find(".variable").prop("aria-label")).toEqual("Zavřít")
  })
})
