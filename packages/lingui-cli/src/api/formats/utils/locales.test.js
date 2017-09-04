import * as locales from './locales'

describe('Catalog formats utilities - locales', function () {
  it('isValid - should validate locale format', function () {
    expect(locales.isValid('en')).toBeTruthy()
    expect(locales.isValid('en_US')).toBeTruthy()
    expect(locales.isValid('en_us')).toBeTruthy()
    expect(locales.isValid('en-US')).toBeFalsy()
    expect(locales.isValid('en-us')).toBeFalsy()
    expect(locales.isValid('xyz')).toBeFalsy()
  })

  it('parse - should parse language and country from locale', function () {
    expect(locales.parse('en')).toEqual({ language: 'en' })
    expect(locales.parse('en_US')).toEqual({ language: 'en', country: 'US' })
    expect(locales.parse('en_us')).toEqual({ language: 'en', country: 'us' })
    expect(locales.parse('en-US')).toBeNull()
    expect(locales.parse('en-us')).toBeNull()
  })
})
