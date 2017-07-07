import { isString, isFunction, isEmpty } from './essentials'

describe('isString', function () {
  it('should check string', function () {
    expect(isString('Hello')).toBeTruthy()
    expect(isString(42)).toBeFalsy()
    expect(isString([42])).toBeFalsy()
  })
})

describe('isFunction', function () {
  it('should check function', function () {
    expect(isFunction(function () {})).toBeTruthy()
    expect(isFunction(() => {})).toBeTruthy()
    expect(isFunction('Nope')).toBeFalsy()
  })
})

describe('isEmpty', function () {
  it('should check empty object', function () {
    expect(isEmpty(null)).toBeTruthy()
    expect(isEmpty(undefined)).toBeTruthy()
    expect(isEmpty([])).toBeTruthy()
    expect(isEmpty({})).toBeTruthy()
    expect(isEmpty([1])).toBeFalsy()
    expect(isEmpty({a: 1})).toBeFalsy()
  })
})
