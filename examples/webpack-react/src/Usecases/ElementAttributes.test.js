// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider } from "lingui-react"
import linguiDev from "lingui-react/dev"

import ElementAttributes from "./ElementAttributes"

describe("ElementAttributes", function() {
  const catalogs = {
    en: {},
    cs: {
      messages: {
        "Full content of {articleName}": "Celý článek {articleName}",
        Close: "Zavřít"
      }
    }
  }

  const Component = ({ language }: { language: string }) => (
    <I18nProvider
      language={language}
      catalogs={catalogs}
      development={linguiDev}
    >
      <ElementAttributes />
    </I18nProvider>
  )

  it("should demostrate i18n in html attributes", function() {
    const node = mount(<Component language="en" />)
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
