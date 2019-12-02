// @flow
import * as React from "react"
import { shallow, mount } from "enzyme"

import { setupI18n } from "@lingui/core"
import { I18nProvider, Trans } from "@lingui/react"
import { makeLinguiPublisher } from "./I18nProvider"
import { mockConsole } from "./mocks"

describe("I18nProvider", function() {
  const props = {
    catalogs: {
      cs: {
        messages: {
          "All human beings are born free and equal in dignity and rights.":
            "Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv."
        }
      },
      en: {
        messages: {}
      }
    },
    language: "cs"
  }

  it("should provide context with i18n data", function() {
    const component = shallow(
      <I18nProvider {...props}>
        <div />
      </I18nProvider>
    ).instance()
    const linguiPublisher = component.getChildContext()["linguiPublisher"]
    expect(linguiPublisher.i18n.messages).toEqual(
      props.catalogs[props.language].messages
    )
    expect(linguiPublisher.i18n.language).toEqual(props.language)
    expect(linguiPublisher.subscribe).toBeInstanceOf(Function)
    expect(linguiPublisher.unsubscribe).toBeInstanceOf(Function)
    expect(linguiPublisher.update).toBeInstanceOf(Function)
  })

  it("should throw an error on incorrect language", function() {
    mockConsole(console => {
      mount(
        <I18nProvider language="xyz">
          <div />
        </I18nProvider>
      )
      expect(console.warn).toBeCalledWith(
        'Message catalog for locale "xyz" not loaded.'
      )
    })
  })

  it("should render children", function() {
    const child = <div className="testcase" />
    expect(
      shallow(<I18nProvider {...props}>{child}</I18nProvider>).contains(child)
    ).toBeTruthy()
  })

  it("shouldn't have default render component (i.e. render translation without wrapping span)", function() {
    const component = shallow(
      <I18nProvider {...props}>
        <div />
      </I18nProvider>
    ).instance()
    const defaultRender = component.getChildContext()["linguiDefaultRender"]
    expect(defaultRender).toEqual(null)
  })

  it("should pass custom render component in context", function() {
    const h1 = <h1 />
    const component = shallow(
      <I18nProvider {...props} defaultRender={h1}>
        <div />
      </I18nProvider>
    ).instance()
    const defaultRender = component.getChildContext()["linguiDefaultRender"]
    expect(defaultRender).toEqual(h1)
  })

  it("should notify all subscribers about context change", function() {
    const node = mount(
      <I18nProvider
        language="en"
        catalogs={{
          en: {},
          cs: {}
        }}
      >
        <div />
      </I18nProvider>
    )
    const instance = node.instance()
    const listener = jest.fn()

    instance.linguiPublisher.subscribe(listener)
    expect(listener).not.toBeCalled()

    node.setProps({ language: "en" })
    expect(listener).not.toBeCalled()

    node.setProps({ language: "cs" })
    expect(listener).toBeCalled()
    listener.mockClear()

    node.setProps({ locales: "cs-CZ" })
    expect(listener).toBeCalled()
  })

  it("should render custom message for missing translation", function() {
    const text = node =>
      mount(<I18nProvider missing="xxx">{node}</I18nProvider>)
        .find("Render")
        .text()
    const translation = text(<Trans id="missing" />)
    expect(translation).toEqual("xxx")
  })
})

describe("I18nPublisher", function() {
  it("should pass active language and messages to underlying I18n class", function() {
    const linguiPublisher = makeLinguiPublisher(
      setupI18n({
        language: "en",
        catalogs: {
          en: {
            messages: { msg: "hello" }
          },
          fr: {
            messages: { msg: "salut" }
          }
        }
      })
    )

    expect(linguiPublisher.i18n.language).toEqual("en")
    expect(linguiPublisher.i18n.messages).toEqual({ msg: "hello" })

    linguiPublisher.update({ language: "fr" })
    expect(linguiPublisher.i18n.language).toEqual("fr")
    expect(linguiPublisher.i18n.messages).toEqual({ msg: "salut" })

    linguiPublisher.update({
      catalogs: {
        fr: {
          messages: { msg: "salut!" },
          languageData: {
            plurals: () => "Function"
          }
        }
      }
    })
    expect(linguiPublisher.i18n.language).toEqual("fr")
    expect(linguiPublisher.i18n.messages).toEqual({ msg: "salut!" })
    expect(typeof linguiPublisher.i18n.languageData.plurals).toEqual("function")
  })

  it("should subscribe/unsubscribe listeners for context changes", function() {
    const linguiPublisher = makeLinguiPublisher(
      setupI18n({
        language: "en",
        catalogs: { en: { messages: {} } }
      })
    )
    const listener = jest.fn()

    expect(linguiPublisher.getSubscribers()).toEqual([])

    linguiPublisher.subscribe(listener)
    expect(linguiPublisher.getSubscribers()).toEqual([listener])

    linguiPublisher.unsubscribe(listener)
    expect(linguiPublisher.getSubscribers()).toEqual([])
  })

  it("should notify listeners only when relevant data changes", function() {
    const listener = jest.fn()
    const linguiPublisher = makeLinguiPublisher(
      setupI18n({
        language: "en",
        catalogs: { en: { messages: {} }, fr: { messages: {} } }
      })
    )
    linguiPublisher.subscribe(listener)

    expect(listener).not.toBeCalled()

    linguiPublisher.update()
    expect(listener).not.toBeCalled()

    linguiPublisher.update({ completelyDifferentProp: 42 })
    expect(listener).not.toBeCalled()

    linguiPublisher.update({ language: "fr" })
    expect(listener).toBeCalled()
    listener.mockClear()

    linguiPublisher.update({ locales: "fr-BE" })
    expect(listener).toBeCalled()
    listener.mockClear()

    linguiPublisher.update({ catalogs: { en: { messages: { id: "hello" } } } })
    expect(listener).toBeCalled()
  })
})
