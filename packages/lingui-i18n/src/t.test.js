import t from './t'

describe('.t', function () {
  describe('as a function', function() {
    it('should pass message and params to i18n.translate', function() {
      const i18n = {
        translate: jest.fn((msg, params) => ({ msg, params }))
      }

      expect(t(i18n)('Message')).toEqual({
        msg: 'Message',
        params: {}
      })

      const name = 'Fred'
      expect(t(i18n)('Hello {name}', { name })).toEqual({
        msg: 'Hello {name}',
        params: {
          name: 'Fred'
        }
      })

    })
  })
  describe('as a template tag', function() {
    it('should replace variables with placeholders', function () {
      const i18n = {
        translate: jest.fn((msg, params) => ({ msg, params }))
      }

      const name = 'World'
      const end = 'End'

      expect(t(i18n)`Text only`).toEqual({ msg: "Text only", params: {} })

      // positional arguments
      expect(t(i18n)`${name} middle ${end}`).toEqual({
        msg: "{0} middle {1}",
        params: { 0: name, 1: end }
      })
      expect(t(i18n)`${name} end`).toEqual({
        msg: "{0} end",
        params: { 0: name }
      })
      expect(t(i18n)`beginning ${name}`).toEqual({
        msg: "beginning {0}",
        params: { 0: name }
      })

      // named arguments
      expect(t(i18n)`Hello ${{ name }}!`).toEqual({
        msg: "Hello {name}!",
        params: { name }
      })
    })
  })
})
