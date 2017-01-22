import React from 'react'
import Trans from './Trans'
import { shallow } from 'enzyme'

describe('Trans component', function() {
  /*
   * Setup context, define helpers
   */
  const context = {
    i18n: {
      catalog: {
        'All human beings are born free and equal in dignity and rights.': 'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
      }
    }
  }
  const text = (node) => shallow(node, { context }).dive().text()

  /*
   * Tests
   */

  it("shouldn\'t throw runtime error without i18n context", function() {
    expect(shallow(<Trans id="unknown" />).dive().text()).toEqual('unknown')
  })

  it('should render default string', function() {
    expect(text(<Trans id="unknown" />))
      .toEqual('unknown')

    expect(text(<Trans id="unknown" defaults="Not translated yet" />))
      .toEqual('Not translated yet')
  })

  it('should render translation', function() {
    const translation = text(
      <Trans id="All human beings are born free and equal in dignity and rights." />
    )

    expect(translation).toEqual(
      'Všichni lidé rodí se svobodní a sobě rovní co do důstojnosti a práv.'
    )
  })
})
