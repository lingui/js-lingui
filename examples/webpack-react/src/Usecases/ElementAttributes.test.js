// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider, setupI18n } from "@lingui/react"

import ElementAttributes from "./ElementAttributes"

describe("ElementAttributes", function() {
  const mountWithI18n = (locale: string) => {
    const i18n = setupI18n({
      locale,
      catalogs: {
        en: {},
        cs: {
          messages: {
            "Full content of {articleName}": "Celý článek {articleName}",
            Close: "Zavřít"
          }
        }
      }
    })

    return {
      i18n,
      node: mount(
        <I18nProvider i18n={i18n}>
          <ElementAttributes />
        </I18nProvider>
      )
    }
  }

  it("should demostrate i18n in html attributes", function() {
    const { node, i18n } = mountWithI18n("en")
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
