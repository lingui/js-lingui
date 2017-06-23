// @flow
import compile from './compile'

const mockEnv = (env, testCase) => {
  const oldEnv = process.env.NODE_ENV
  process.env.NODE_ENV = env

  try {
    testCase()
  } catch(e) {
    process.env.NODE_ENV = oldEnv
    throw e
  }

  process.env.NODE_ENV = oldEnv
}

describe('compile', function () {
  describe('parsing and compiling messages in development', function () {
    it('should compile static message', function () {
      const cache = compile('en', 'Static message')
      expect(cache()).toEqual('Static message')

      mockEnv('production', () => {
        const cache = compile('en', 'Static message')
        expect(cache()).toEqual('Static message')
      })
    })

    it('should compile message with variable', function () {
      const cache = compile('en', 'Hey {name}!')
      expect(cache({ name: 'Joe' })).toEqual('Hey Joe!')
    })

    it('should compile plurals', function () {
      const plural = compile('en', '{value, plural, one {{value} Book} other {# Books}}')
      expect(plural({ value: 1 })).toEqual('1 Book')
      expect(plural({ value: 2 })).toEqual('2 Books')

      const offset = compile('en', '{value, plural, offset:1 =0 {No Books} one {# Book} other {# Books}}')
      expect(offset({ value: 0 })).toEqual('No Books')
      expect(offset({ value: 2 })).toEqual('1 Book')
      expect(offset({ value: 3 })).toEqual('2 Books')
    })

    it('should compile selectordinal', function () {
      const cache = compile('en', '{value, selectordinal, one {1st Book} two {2nd Book}}')
      expect(cache({ value: 1 })).toEqual('1st Book')
      expect(cache({ value: 2 })).toEqual('2nd Book')
    })

    it('should compile select', function () {
      const cache = compile('en', '{value, select, female {She} other {They}}')
      expect(cache({ value: 'female' })).toEqual('She')
      expect(cache({ value: 'n/a' })).toEqual('They')
    })

    it('should compile custom format', function () {
      const number = compile('en', '{value, number}')
      expect(number({ value: 0.1 })).toEqual('0.1')

      const percent = compile('en', '{value, number, percent}')
      expect(percent({ value: 0.1 })).toEqual('10%')
      expect(percent({ value: 0.2 })).toEqual('20%')

      const now = new Date('3/4/2017')
      const date = compile('en', '{value, date}')
      expect(date({ value: now })).toEqual('3/4/2017')

      const currency = compile('en', '{value, number, currency}', {}, {
        currency: {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2
        }
      })
      expect(currency({ value: 0.1 })).toEqual('€0.10')
      expect(currency({ value: 1 })).toEqual('€1.00')
    })
  })

  describe('compiling parsed messages in production', function () {
    const englishPlurals = {
      plurals (value, ordinal) {
        if (ordinal) {
          return {'1': 'one', '2': 'two', '3': 'few'}[value] || 'other'
        } else {
          return value === 1 ? 'one' : 'other'
        }
      }
    }

    it('should compile static message', function () {
      const cache = compile('en', 'Static message')
      expect(cache()).toEqual('Static message')
    })

    it('should compile message with variable', function () {
      const cache = compile('en', a => ['Hey ', a('name'), '!'])
      expect(cache({ name: 'Joe' })).toEqual('Hey Joe!')
    })

    it('should compile plurals', function () {
      const plural = compile(
        'en',
        a => [a('value', 'plural', {
          one: [a('value'), ' Book'],
          other: [a('value'), ' Books']
        })],
        englishPlurals
      )
      expect(plural({ value: 1 })).toEqual('1 Book')
      expect(plural({ value: 2 })).toEqual('2 Books')

      const offset = compile(
        'en',
        a => [a('value', 'plural', {
          offset: 1,
          '0': 'No Books',
          one: ['#', ' Book'],
          other: ['#', ' Books']
        })],
        englishPlurals
      )
      expect(offset({ value: 0 })).toEqual('No Books')
      expect(offset({ value: 2 })).toEqual('1 Book')
      expect(offset({ value: 3 })).toEqual('2 Books')
    })

    it('should compile selectordinal', function () {
      const cache = compile(
        'en',
        a => [a('value', 'selectordinal', {
          one: '1st Book',
          two: '2nd Book'
        })],
        englishPlurals
      )
      expect(cache({ value: 1 })).toEqual('1st Book')
      expect(cache({ value: 2 })).toEqual('2nd Book')
    })

    it('should compile select', function () {
      const cache = compile(
        'en',
        a => [a('value', 'select', {
          female: 'She',
          other: 'They'
        })]
      )
      expect(cache({ value: 'female' })).toEqual('She')
      expect(cache({ value: 'n/a' })).toEqual('They')
    })

    it('should compile custom format', function () {
      const number = compile('en', a => a('value', 'number'))
      expect(number({ value: 0.1 })).toEqual('0.1')

      const percent = compile('en', a => a('value', 'number', 'percent'))
      expect(percent({ value: 0.1 })).toEqual('10%')
      expect(percent({ value: 0.2 })).toEqual('20%')

      const now = new Date('3/4/2017')
      const date = compile('en', a => a('value', 'date'))
      expect(date({ value: now })).toEqual('3/4/2017')

      const currency = compile('en', a => a('value', 'number', 'currency'), {}, {
        currency: {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2
        }
      })
      expect(currency({ value: 0.1 })).toEqual('€0.10')
      expect(currency({ value: 1 })).toEqual('€1.00')
    })
  })

})
