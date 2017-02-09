import { plural, select } from '.'

describe('plural', function() {
  it('should convert to message format string', function() {
    expect(plural({
      value: { value: 42 },
      one: "# book",
      others: "# books"
    }).message).toEqual("{value, plural, one {# book} others {# books}}")

    expect(plural({
      value: 42,
      one: "# book",
      others: "# books"
    }).message).toEqual("{0, plural, one {# book} others {# books}}")

    expect(plural({
      value: { value: 42 },
      offset: 1,
      0: "No books",
      1: "One book"
    }).message).toEqual("{value, plural, offset:1 =0 {No books} =1 {One book}}")
  })
})

describe('select', function() {
  it('should convert to message format string', function() {
    expect(select({
      value: { value: 42 },
      male: "He",
      female: "She"
    }).message).toEqual("{value, select, male {He} female {She}}")

    expect(select({
      value: 42,
      male: "He",
      female: "She"
    }).message).toEqual("{0, select, male {He} female {She}}")
  })
})
