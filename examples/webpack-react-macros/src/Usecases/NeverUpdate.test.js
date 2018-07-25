// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider } from "@lingui/react"

import NeverUpdate from "./NeverUpdate"
import Children from "./Children"
import ElementAttributes from "./ElementAttributes"

describe("NeverUpdate", function() {
  const catalogs = {
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

  const BeConservative = WrappedComponent => ({
    language
  }: {
    language: string
  }) => (
    <I18nProvider language={language} catalogs={catalogs}>
      <NeverUpdate>
        <WrappedComponent />
      </NeverUpdate>
    </I18nProvider>
  )

  const getText = (node, element) => {
    return node
      .find(element)
      .first()
      .text()
  }

  it("should update translation of children when language changes", function() {
    const ConvervativeChildren = BeConservative(Children)

    const node = mount(<ConvervativeChildren language="en" />)
    expect(getText(node, ".untranslated")).toEqual("This isn't translated")
    expect(getText(node, ".customId")).toEqual("msg.label")
    expect(getText(node, ".translated")).toEqual("Hello World")
    expect(getText(node, ".variable")).toEqual("My name is Mononoke")

    node.setProps({ language: "cs" })
    expect(getText(node, ".untranslated")).toEqual("This isn't translated")
    expect(getText(node, ".customId")).toEqual("Nápis")
    expect(getText(node, ".translated")).toEqual("Ahoj světe")
    expect(getText(node, ".variable")).toEqual("Jmenuji se Mononoke")
  })

  it.skip("should update translation of attributes when language changes", function() {
    const ConvervativeAttributes = BeConservative(ElementAttributes)

    const node = mount(<ConvervativeAttributes language="en" />)
    expect(node.find(".expression").prop("title")).toEqual(
      "Full content of Scientific Journal"
    )
    expect(node.find(".variable").prop("aria-label")).toEqual("Close")

    node.setProps({ language: "cs" })
    node.update()
    expect(node.find(".expression").prop("title")).toEqual(
      "Celý článek Scientific Journal"
    )
    expect(node.find(".variable").prop("aria-label")).toEqual("Zavřít")
  })
})
