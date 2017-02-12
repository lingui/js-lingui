/* @flow */
import t from './t'
import { I18n } from './i18n'

describe('.t', function () {
  const i18n = new I18n()
  // $FlowIgnore: Mock function
  i18n.translate = jest.fn(id => id)

  describe('as a function', function () {
    it('should pass message and params to i18n.translate', function () {
      expect(t(i18n)({ id: 'Message' })).toEqual({
        id: 'Message',
        params: undefined
      })

      const name = 'Fred'
      expect(t(i18n)({ id: 'Hello {name}', params: { name } })).toEqual({
        id: 'Hello {name}',
        params: { name }
      })
    })
  })

  describe('as a template tag', function () {
    it('should return processed message', function () {
      const name = 'World'
      expect(t(i18n)`Text only`).toEqual('Text only')
      expect(t(i18n)`Hello ${name}!`).toEqual('Hello World!')
    })
  })
})
