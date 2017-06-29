/* @flow */
import t from './t'

describe('.t', function () {
  it('should return processed message', function () {
    const name = 'World'
    expect(t`Text only`).toEqual('Text only')
    expect(t`Hello ${name}!`).toEqual('Hello World!')
  })
})
