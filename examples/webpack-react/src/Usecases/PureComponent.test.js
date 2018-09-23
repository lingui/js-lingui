// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider, setupI18n } from "@lingui/react"

import PureComponent from "./PureComponent"

describe("PureComponent", function() {
  const mountWithI18n = () => {
    const Component = ({ value = 1 }: { value: number }) => (
      <I18nProvider i18n={i18n}>
        <PureComponent value={value} />
      </I18nProvider>
    )
    const i18n = setupI18n({
      locale: "en",
      catalogs: {
        en: {},
        cs: {
          messages: {
            "The value is: {value}": "Hodnota je: {value}"
          }
        }
      }
    })

    return {
      i18n,
      node: mount(<Component value={1} />)
    }
  }

  const text = (node, element) => {
    return node
      .find(element)
      .first()
      .text()
  }

  it("should update translation of children when language changes", function() {
    const { node, i18n } = mountWithI18n()
    expect(text(node, ".valid")).toEqual("The value is: 1")
    expect(text(node, ".invalid")).toEqual("The value is: 1")
    node.setProps({ value: 11 })
    expect(text(node, ".valid")).toEqual("The value is: 11")
    expect(text(node, ".invalid")).toEqual("The value is: 11")

    i18n.activate("cs")
    node.update()
    expect(text(node, ".valid")).toEqual("Hodnota je: 11")
    expect(text(node, ".invalid")).toEqual("The value is: 11")
  })
})
