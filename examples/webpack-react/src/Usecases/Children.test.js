// @flow
import * as React from "react"
import { mount } from "enzyme"
import { I18nProvider } from "lingui-react"
import linguiDev from "lingui-i18n/dev"

import Children from "./Children"

describe("Children", function() {
  const catalogs = {
    en: {},
    cs: {
      messages: {
        "msg.label": "Nápis",
        "Hello World": "Ahoj světe",
        "My name is {name}": "Jmenuji se {name}",
        "Read <0>more</0>": "Číst <0>dále</0>",
        "Full content of {articleName}": "Celé znění článku {articleName}",
        "{genderOfHost, select, female {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to her party.} one {{host} invites {guest} and one other person to her party.} other {{host} invites {guest} and # other people to her party.}}} male {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to his party.} one {{host} invites {guest} and one other person to her party.} other {{host} invites {guest} and # other people to her party.}}} other {{numGuests, plural, offset:1 =0 {{host} does not give a party.} =1 {{host} invites {guest} to their party.} one {{host} invites {guest} and one other person to her party.} other {{host} invites {guest} and # other people to her party.}}}}":
          "{genderOfHost, select, female {{numGuests, plural, offset:1 =0 {{host} nepořádá oslavu.} =1 {{host} pozvala {guest} na její oslavu.} one {{host} pozvala {guest} a dalšího hosta na její oslavu.} few {{host} pozvala {guest} a # další hosty na její oslavu.} other {{host} pozvala {guest} a # dalších hostů na její oslavu.}}} other {{numGuests, plural, offset:1 =0 {{host} nepořádá oslavu.} =1 {{host} pozval {guest} na jeho oslavu.} one {{host} pozval {guest} a dalšího hosta na jeho oslavu.} few {{host} pozval {guest} a # další hosty na jeho oslavu} other {{host} pozval {guest} a # dalších hostů na jeho poslavu.}}}}"
      }
    }
  }

  const Component = ({ language, ...props }: { language: string }) => (
    <I18nProvider
      language={language}
      catalogs={catalogs}
      development={linguiDev}
    >
      <Children {...props} />
    </I18nProvider>
  )

  const getText = (element, props = {}) => {
    return mount(<Component {...props} language="cs" />)
      .find(element)
      .first()
      .text()
  }

  const getHtml = (element, props = {}) => {
    return mount(<Component {...props} language="cs" />)
      .find(element)
      .first()
      .html()
  }

  it("should render", function() {
    expect(mount(<Component language="cs" />)).toMatchSnapshot()
  })

  it("should render defaults with warning for untranslated", function() {
    expect(getText(".untranslated")).toEqual("This isn't translated")
  })

  it("should support custom message id", function() {
    expect(getText(".customId")).toEqual("Nápis")
  })

  it("should render translated string", function() {
    expect(getText(".translated")).toEqual("Ahoj světe")
  })

  it("should support variable substitution", function() {
    expect(getText(".variable")).toEqual("Jmenuji se Mononoke")
    expect(getText(".variable", { name: "Fred" })).toEqual("Jmenuji se Fred")
  })

  it("should support nested elements", function() {
    expect(getHtml(".components")).toMatchSnapshot()
  })

  it("should support pluralization", function() {
    expect(getText(".plural")).toEqual(
      "Wilma pozvala Fred a dalšího hosta na její oslavu."
    )
  })
})
