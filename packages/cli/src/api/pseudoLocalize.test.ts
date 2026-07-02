import pseudoLocalize from "./pseudoLocalize.js"

describe("PseudoLocalization", () => {
  it("should pseudolocalize strings", () => {
    expect(pseudoLocalize("Martin Černý")).toEqual("Ḿàŕţĩń Čēŕńý")
  })

  it("should not pseudolocalize HTML tags", () => {
    expect(pseudoLocalize('Martin <span id="spanId">Černý</span>')).toEqual(
      'Ḿàŕţĩń <span id="spanId">Čēŕńý</span>',
    )
    expect(
      pseudoLocalize("Martin Cerny  123a<span id='id'>Černý</span>"),
    ).toEqual("Ḿàŕţĩń Ćēŕńŷ  123à<span id='id'>Čēŕńý</span>")
    expect(pseudoLocalize("Martin <a title='>>'>a</a>")).toEqual(
      "Ḿàŕţĩń <a title='>>'>à</a>",
    )
    expect(pseudoLocalize("<a title=TITLE>text</a>")).toEqual(
      "<a title=TITLE>ţēxţ</a>",
    )
  })

  describe("Plurals", () => {
    it("with value", () => {
      expect(
        pseudoLocalize("{value, plural, one {# book} other {# books}}"),
      ).toEqual("{value, plural, one {# ƀōōķ} other {# ƀōōķś}}")
    })

    it("with variable placeholder", () => {
      expect(
        pseudoLocalize(
          "{count, plural, one {{countString} book} other {{countString} books}}",
        ),
      ).toEqual(
        "{count, plural, one {{countString} ƀōōķ} other {{countString} ƀōōķś}}",
      )
    })

    it("with offset", () => {
      expect(
        pseudoLocalize(
          "{count, plural, offset:1 zero {There are no messages} other {There are # messages in your inbox}}",
        ),
      ).toEqual(
        "{count, plural, offset:1 zero {Ţĥēŕē àŕē ńō ḿēśśàĝēś} other {Ţĥēŕē àŕē # ḿēśśàĝēś ĩń ŷōũŕ ĩńƀōx}}",
      )
    })

    it("with HTML tags", () => {
      expect(
        pseudoLocalize(
          "{count, plural, zero {There's # <span>message</span>} other {There are # messages}}",
        ),
      ).toEqual(
        "{count, plural, zero {Ţĥēŕē'ś # <span>ḿēśśàĝē</span>} other {Ţĥēŕē àŕē # ḿēśśàĝēś}}",
      )
    })

    it("with exact number", () => {
      expect(
        pseudoLocalize(
          "{count, plural, =0 {There's # <span>message</span>} other {There are # messages}}",
        ),
      ).toEqual(
        "{count, plural, =0 {Ţĥēŕē'ś # <span>ḿēśśàĝē</span>} other {Ţĥēŕē àŕē # ḿēśśàĝēś}}",
      )
    })
  })

  it("SelectOrdinal", () => {
    expect(
      pseudoLocalize(
        "{count, selectordinal, offset:1 one {#st} two {#nd} few {#rd} =4 {4th} many {testMany} other {#th}}",
      ),
    ).toEqual(
      "{count, selectordinal, offset:1 one {#śţ} two {#ńď} few {#ŕď} =4 {4ţĥ} many {ţēśţḾàńŷ} other {#ţĥ}}",
    )
  })

  it("Select", () => {
    expect(
      pseudoLocalize(
        "{gender, select, male {He} female {She} other {<span>Other</span>}}",
      ),
    ).toEqual(
      "{gender, select, male {Ĥē} female {Śĥē} other {<span>Ōţĥēŕ</span>}}",
    )
  })

  it("should not pseudolocalize variables", () => {
    expect(pseudoLocalize("replace {count}")).toEqual("ŕēƥĺàćē {count}")
    expect(pseudoLocalize("replace { count }")).toEqual("ŕēƥĺàćē { count }")
  })

  it("multiple plurals pseudolocalize gives wrong ICU message", () => {
    expect(
      pseudoLocalize(
        "{bcount, plural, one {boy} other {# boys}} {gcount, plural, one {girl} other {# girls}}",
      ),
    ).not.toEqual(
      "{bcount, plural, one {ƀōŷ} other {# ƀōŷś}} {gcount, plural, one {ĝĩŕĺ} other {# ĝĩŕĺś}}",
    )
  })

  describe("options", () => {
    it("should prepend and append the configured markers", () => {
      expect(
        pseudoLocalize("Martin Černý", { prepend: "[!!", append: "!!]" }),
      ).toEqual("[!!Ḿàŕţĩń Čēŕńý!!]")
    })

    it("should override every (non-token) character", () => {
      expect(pseudoLocalize("replace {count}", { override: "_" })).toEqual(
        "________{count}",
      )
    })

    it("should extend the string length", () => {
      expect(pseudoLocalize("Hello", { extend: 1 }).length).toBeGreaterThan(
        pseudoLocalize("Hello").length,
      )
    })

    it("should ignore an attempt to override the internal delimiter", () => {
      expect(
        pseudoLocalize("Martin <span>Černý</span>", {
          // @ts-expect-error delimiter is not part of the public options
          delimiter: "%",
        }),
      ).toEqual("Ḿàŕţĩń <span>Čēŕńý</span>")
    })
  })
})
