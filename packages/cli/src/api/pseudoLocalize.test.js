import pseudoLocalize from "./pseudoLocalize"

describe("PseudoLocalization", () => {
  it("should pseudolocalize strings", () => {
    expect(pseudoLocalize("Martin Černý")).toEqual("Màŕţĩń Čēŕńý")
  })

  it("should not pseudolocalize HTML tags", () => {
    expect(pseudoLocalize('Martin <span id="spanId">Černý</span>')).toEqual(
      'Màŕţĩń <span id="spanId">Čēŕńý</span>'
    )
    expect(
      pseudoLocalize("Martin Cerny  123a<span id='id'>Černý</span>")
    ).toEqual("Màŕţĩń Ćēŕńŷ  123à<span id='id'>Čēŕńý</span>")
    expect(pseudoLocalize("Martin <a title='>>'>a</a>")).toEqual(
      "Màŕţĩń <a title='>>'>à</a>"
    )
    expect(pseudoLocalize("<a title=TITLE>text</a>")).toEqual(
      "<a title=TITLE>ţēxţ</a>"
    )
  })

  it("should pseudlocalize plurals with HTML tags", () => {
    expect(
      pseudoLocalize(
        "{messagesCount, plural, zero {There's # <span>message</span>} other {There're # messages}"
      )
    ).toEqual(
      "{messagesCount, plural, zero {Ţĥēŕē'ś # <span>mēśśàĝē</span>} other {Ţĥēŕē'ŕē # mēśśàĝēś}"
    )
  })

  it("should pseudolocalize plurals", () => {
    expect(
      pseudoLocalize("{value, plural, one {# book} other {# books}}")
    ).toEqual("{value, plural, one {# ƀōōķ} other {# ƀōōķś}}")
    expect(
      pseudoLocalize("{count, plural, one {{countString} book} other {{countString} books}}")
    ).toEqual("{count, plural, one {{countString} ƀōōķ} other {{countString} ƀōōķś}}")
  })

  it("shouldn't pseudolocalize variables", () => {
    expect(pseudoLocalize("replace {count}")).toEqual("ŕēƥĺàćē {count}")
    expect(pseudoLocalize("replace { count }")).toEqual("ŕēƥĺàćē { count }")
  })
})
