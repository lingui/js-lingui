/* @flow */
import React from 'react'
import { Trans } from '.'
import { I18n } from 'lingui-i18n'
import { shallow, mount } from 'enzyme'

describe('Trans component', function () {
  /*
   * Setup context, define helpers
   */
  const context = {
    i18nManager: {
      i18n: new I18n('en', {
        en: {
          'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.',
          'My name is {name}': 'Jmenuji se {name}',
          'Original': 'Původní',
          'Updated': 'Aktualizovaný'
        }
      })
    }
  }
  // $FlowIgnore: missing annotation for dive()
  const text = (node) => shallow(node, { context }).dive().text()

  /*
   * Tests
   */

  it("shouldn't throw runtime error without i18n context", function () {
    // $FlowIgnore: missing annotation for dive()
    expect(shallow(<Trans id="unknown" />).dive().text()).toEqual('unknown')
  })

  it('should recompile msg when id or defaults changes', function () {
    const node = mount(<Trans id="Original" defaults="Original" />, { context })
    expect(node.text()).toEqual('Původní')

    node.setProps({ id: 'Updated' })
    expect(node.text()).toEqual('Aktualizovaný')

    // doesn't affect when different prop is changed
    node.setProps({ other: 'other' })
    expect(node.text()).toEqual('Aktualizovaný')

    // either different id or defaults trigger change
    node.setProps({ id: 'Unknown' })
    expect(node.text()).toEqual('Original')
    node.setProps({ defaults: 'Unknown' })
    expect(node.text()).toEqual('Unknown')
  })

  it('should render default string', function () {
    expect(text(<Trans id="unknown" />))
      .toEqual('unknown')

    expect(text(<Trans id="unknown" defaults="Not translated yet" />))
      .toEqual('Not translated yet')
  })

  it('should render translation', function () {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights." />
    )

    expect(translation).toEqual(
      'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
    )
  })
})
