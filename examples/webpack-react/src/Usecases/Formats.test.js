// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider, setupI18n } from "@lingui/react"

import Formats from "./Formats"

describe("Formats", function() {
  const Component = () => {
    const i18n = setupI18n({ locale: "en" })
    return (
      <I18nProvider i18n={i18n}>
        <Formats />
      </I18nProvider>
    )
  }

  const text = (element, props = {}) => {
    return mount(<Component {...props} />)
      .find(element)
      .first()
      .text()
  }

  it("should render", function() {
    expect(mount(<Component />)).toMatchSnapshot()
  })

  it("should render percent", function() {
    expect(text(".percent")).toEqual("The answer is 42%")
  })

  it("should render date", function() {
    expect(text(".date")).toEqual("Today is 4/5/2017")
  })
})
