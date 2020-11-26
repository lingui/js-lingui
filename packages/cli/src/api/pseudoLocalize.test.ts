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

  describe("Plurals", () => {
    it("with value", () => {
      expect(
        pseudoLocalize("{value, plural, one {# book} other {# books}}")
      ).toEqual("{value, plural, one {# ƀōōķ} other {# ƀōōķś}}")
    })

    it("with variable placeholder", () => {
      expect(
        pseudoLocalize(
          "{count, plural, one {{countString} book} other {{countString} books}}"
        )
      ).toEqual(
        "{count, plural, one {{countString} ƀōōķ} other {{countString} ƀōōķś}}"
      )
    })

    it("with offset", () => {
      expect(
        pseudoLocalize(
          "{count, plural, offset:1 zero {There're no messages} other {There're # messages in your inbox}}"
        )
      ).toEqual(
        "{count, plural, offset:1 zero {Ţĥēŕē'ŕē ńō mēśśàĝēś} other {Ţĥēŕē'ŕē # mēśśàĝēś ĩń ŷōũŕ ĩńƀōx}}"
      )
    })

    it("with HTML tags", () => {
      expect(
        pseudoLocalize(
          "{count, plural, zero {There's # <span>message</span>} other {There're # messages}"
        )
      ).toEqual(
        "{count, plural, zero {Ţĥēŕē'ś # <span>mēśśàĝē</span>} other {Ţĥēŕē'ŕē # mēśśàĝēś}"
      )
    })

    it("with exact number", () => {
      expect(
        pseudoLocalize(
          "{count, plural, =0 {There's # <span>message</span>} other {There're # messages}"
        )
      ).toEqual(
        "{count, plural, =0 {Ţĥēŕē'ś # <span>mēśśàĝē</span>} other {Ţĥēŕē'ŕē # mēśśàĝēś}"
      )
    })
  })

  it("should not pseudolocalize variables", () => {
    expect(pseudoLocalize("replace {count}")).toEqual("ŕēƥĺàćē {count}")
    expect(pseudoLocalize("replace { count }")).toEqual("ŕēƥĺàćē { count }")
  })
})
