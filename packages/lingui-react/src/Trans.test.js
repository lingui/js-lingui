/* @flow */
import React from 'react'
import { mount } from 'enzyme'
import { setupI18n } from 'lingui-i18n'

import { Trans } from '.'
import linguiDev from './dev'

describe('Trans component', function () {
  /*
   * Setup context, define helpers
   */
  const i18n = setupI18n({
    language: 'en',
    messages: {
      en: {
        'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.',
        'My name is {name}': 'Jmenuji se {name}',
        'Original': 'Původní',
        'Updated': 'Aktualizovaný',
        'msg.currency': '{value, number, currency}'
      }
    },
    development: linguiDev,
  })

  const context = { i18nManager: { i18n } }
  const text = (node) => mount(node, { context }).find('Render').text()

  /*
   * Tests
   */

  it("shouldn't throw runtime error without i18n context", function () {
    expect(mount(
      <Trans id="unknown"/>).find('Render').text()).toEqual('unknown')
  })

  it('should warn about possible missing babel-plugin', function () {
    const originalConsole = global.console
    global.console = {
      warn: jest.fn()
    }

    mount(<Trans>Label</Trans>)
    expect(global.console.warn).toBeCalledWith(
      expect.stringContaining('lingui-react preset'))

    global.console = originalConsole
  })

  it('should recompile msg when id or defaults changes', function () {
    const node = mount(<Trans id="Original" defaults="Original"/>, { context })
    const t = () => node.find('Render').text()
    expect(t()).toEqual('Původní')

    node.setProps({ id: 'Updated' })
    expect(t()).toEqual('Aktualizovaný')

    // doesn't affect when different prop is changed
    node.setProps({ other: 'other' })
    expect(t()).toEqual('Aktualizovaný')

    // either different id or defaults trigger change
    node.setProps({ id: 'Unknown' })
    expect(t()).toEqual('Original')
    node.setProps({ defaults: 'Unknown' })
    expect(t()).toEqual('Unknown')
  })

  it('should render default string', function () {
    expect(text(<Trans id="unknown"/>))
      .toEqual('unknown')

    expect(text(<Trans id="unknown" defaults="Not translated yet"/>))
      .toEqual('Not translated yet')
  })

  it('should render translation', function () {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights."/>
    )

    expect(translation).toEqual(
      'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
    )
  })

  it('should render translation inside custom component', function () {
    const html1 = mount(
      <Trans render={<p className="lead"/>} id="Original"/>, { context }
    ).find('Render').html()
    const html2 = mount(
      <Trans render={({ translation }) =>
        <p className="lead">{translation}</p>} id="Original"/>, { context }
    ).find('Render').html()

    expect(html1).toEqual('<p class="lead">Původní</p>')
    expect(html2).toEqual(html1)
  })

  it('should render custom format', function () {
    const translation = text(
      <Trans
        id="msg.currency"
        params={{ value: 1 }}
        formats={{
          currency: {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
          }
        }}
      />)
    expect(translation).toEqual('€1.00')
  })
})
