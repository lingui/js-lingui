// @flow
import React from 'react'
import { mount } from 'enzyme'

import { DateFormat } from '.'

describe('DateFormat', function () {
  const languageContext = (code) => ({ context: { i18nManager: { i18n: { language: code } } } })

  it('should render', function () {
    const now = new Date('2017-06-17:14:00.000Z')
    const node = mount(<DateFormat value={now} />, languageContext('en')).find('Render')
    expect(node.text()).toEqual('6/17/2017')
  })

  it('should render translation inside custom component', function () {
    const now = new Date('2017-06-17:14:00.000Z')
    const html1 = mount(
      <DateFormat value={now} render={<p className="lead" />} />,
      languageContext('en')
    ).find('Render').html()
    const html2 = mount(
      <DateFormat value={now} render={({ translation }) => <p className="lead">{translation}</p>} />,
      languageContext('en')
    ).find('Render').html()

    expect(html1).toEqual('<p class="lead">6/17/2017</p>')
    expect(html2).toEqual(html1)
  })
})
