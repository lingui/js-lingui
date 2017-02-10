/* @flow */
import { plural, select } from './select'
import { I18n } from './i18n'

describe('plural', function () {
  const i18n = new I18n('en')

  it('should convert to message format string', function () {
    const p = plural(i18n)
    expect(p({
      value: 1,
      one: '# book',
      other: '# books'
    })).toEqual('1 book')

    expect(p({
      value: 42,
      one: '# book',
      other: '# books'
    })).toEqual('42 books')

    expect(p({
      value: 1,
      offset: 1,
      '0': 'No books',
      '1': 'One book',
      other: '# books'
    })).toEqual('No books')
  })
})

describe('select', function () {
  it('should select option based on value', function () {
    expect(select({
      value: 'male',
      male: 'He',
      female: 'She',
      other: 'They'
    })).toEqual('He')
  })
})
