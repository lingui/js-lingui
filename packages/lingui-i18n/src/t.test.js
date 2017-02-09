import { t } from '.'

describe('.t', function () {
  describe('as a function', function() {
    it('should pass message and params to i18n.translate', function() {
      expect(t('Message')).toEqual({
        message: 'Message',
        params: {}
      })

      const name = 'Fred'
      expect(t('Hello {name}', { name })).toEqual({
        message: 'Hello {name}',
        params: {
          name: 'Fred'
        }
      })

    })
  })
  describe('as a template tag', function() {
    it('should replace variables with placeholders', function () {
      const name = 'World'
      const end = 'End'

      expect(t`Text only`).toEqual({ message: "Text only", params: {} })

      // positional arguments
      expect(t`${name} middle ${end}`).toEqual({
        message: "{0} middle {1}",
        params: { 0: name, 1: end }
      })
      expect(t`${name} end`).toEqual({
        message: "{0} end",
        params: { 0: name }
      })
      expect(t`beginning ${name}`).toEqual({
        message: "beginning {0}",
        params: { 0: name }
      })

      // named arguments
      expect(t`Hello ${{ name }}!`).toEqual({
        message: "Hello {name}!",
        params: { name }
      })
    })
  })
})
