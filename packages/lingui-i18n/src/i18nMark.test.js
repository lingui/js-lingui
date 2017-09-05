import { i18nMark } from './index'

describe('i18nMark', function () {
  it('should be identity function (removed by babel extract plugin)', function () {
    expect(i18nMark(42)).toEqual(42)
  })
})
