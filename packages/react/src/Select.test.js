// @flow
import * as React from "react"
import { mount } from "enzyme"
import { setupI18n } from "@lingui/core"
import { Select, Plural, SelectOrdinal } from "@lingui/react"

describe("Categories", function() {
  const i18n = code =>
    setupI18n({
      language: code,
      catalogs: { [code]: {} }
    })
  const languageContext = code => ({
    context: { linguiPublisher: { i18n: i18n(code) } }
  })

  describe("Plural", function() {
    it("should render translation inside custom component", function() {
      const html1 = mount(
        <Plural
          render={<p className="lead" />}
          value="1"
          one="# book"
          other="# books"
        />,
        languageContext("en")
      )
        .find("Render")
        .html()
      const html2 = mount(
        <Plural
          render={({ translation }) => <p className="lead">{translation}</p>}
          value="1"
          one="# book"
          other="# books"
        />,
        languageContext("en")
      )
        .find("Render")
        .html()

      expect(html1).toEqual('<p class="lead">1 book</p>')
      expect(html2).toEqual(html1)
    })

    it("should render plural correctly", function() {
      const node = mount(
        <Plural value="1" one="# book" other="# books" />,
        languageContext("en")
      )

      const t = () => node.find("Render").text()

      expect(t()).toEqual("1 book")

      node.setProps({ value: 2 })
      expect(t()).toEqual("2 books")
    })

    it("should use plural forms based on language", function() {
      const node = mount(
        <Plural value="1" one="# kniha" few="# knihy" other="# knih" />,
        languageContext("cs")
      )

      const t = () => node.find("Render").text()

      expect(t()).toEqual("1 kniha")

      node.setProps({ value: 2 })
      expect(t()).toEqual("2 knihy")

      node.setProps({ value: 5 })
      expect(t()).toEqual("5 knih")
    })

    it("should offset value", function() {
      const node = mount(
        <Plural
          value="1"
          offset="1"
          _1="one"
          one="one and one another"
          other="other"
        />,
        languageContext("en")
      )

      const t = () => node.find("Render").text()

      expect(t()).toEqual("one")

      node.setProps({ value: 2 })
      expect(t()).toEqual("one and one another")

      node.setProps({ value: 3 })
      expect(t()).toEqual("other")
    })
  })

  describe("SelectOrdinal", function() {
    it("should render ordinal correctly", function() {
      const node = mount(
        <SelectOrdinal value="1" one="#st" two="#nd" few="#rd" other="#th" />,
        languageContext("en")
      )

      const t = () => node.find("Render").text()

      expect(t()).toEqual("1st")

      node.setProps({ value: 2 })
      expect(t()).toEqual("2nd")

      node.setProps({ value: 3 })
      expect(t()).toEqual("3rd")

      node.setProps({ value: 4 })
      expect(t()).toEqual("4th")
    })

    it("should use plural forms based on language", function() {
      // Something Welsh
      // http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
      const node = mount(
        <SelectOrdinal
          value="0"
          zero="# cŵn"
          one="# ci"
          two="# gi"
          few="# chi"
          many="# chi"
          other="# ci"
        />,
        languageContext("cy")
      )
      const t = () => node.find("Render").text()

      expect(t()).toEqual("0 cŵn")

      node.setProps({ value: 1 })
      expect(t()).toEqual("1 ci")

      node.setProps({ value: 2 })
      expect(t()).toEqual("2 gi")

      node.setProps({ value: 3 })
      expect(t()).toEqual("3 chi")

      node.setProps({ value: 5 })
      expect(t()).toEqual("5 chi")

      node.setProps({ value: 10 })
      expect(t()).toEqual("10 ci")
    })

    it("should use other rule when cardinal ones are missing", function() {
      const node = mount(
        <SelectOrdinal value="1" one="Nope" other="1. křižovatka" />,
        languageContext("cs")
      )

      const t = () => node.find("Render").text()
      expect(t()).toEqual("1. křižovatka")
    })

    it("should offset value", function() {
      const node = mount(
        <SelectOrdinal
          value="1"
          offset="1"
          _1="This one"
          one="This one and #st"
          two="This one and #nd"
          few="This one and #rd"
          other="This one and #th"
        />,
        languageContext("en")
      )

      const t = () => node.find("Render").text()
      expect(t()).toEqual("This one")

      node.setProps({ value: 2 })
      expect(t()).toEqual("This one and 1st")

      node.setProps({ value: 3 })
      expect(t()).toEqual("This one and 2nd")

      node.setProps({ value: 4 })
      expect(t()).toEqual("This one and 3rd")

      node.setProps({ value: 5 })
      expect(t()).toEqual("This one and 4th")
    })
  })

  describe("Select", function() {
    it("should render translation inside custom component", function() {
      const html1 = mount(
        <Select
          render={<p className="lead" />}
          value="male"
          male="He"
          female="She"
          other="They"
        />,
        languageContext("en")
      )
        .find("Render")
        .html()
      const html2 = mount(
        <Select
          render={({ translation }) => <p className="lead">{translation}</p>}
          value="male"
          male="He"
          female="She"
          other="They"
        />,
        languageContext("en")
      )
        .find("Render")
        .html()

      expect(html1).toEqual('<p class="lead">He</p>')
      expect(html2).toEqual(html1)
    })

    it("should render Select correctly", function() {
      const node = mount(
        <Select value="male" male="He" female="She" other="They" />,
        languageContext("en")
      )

      const t = () => node.find("Render").text()

      expect(t()).toEqual("He")

      node.setProps({ value: "female" })
      expect(t()).toEqual("She")

      node.setProps({ value: "nan" })
      expect(t()).toEqual("They")
    })
  })
})
