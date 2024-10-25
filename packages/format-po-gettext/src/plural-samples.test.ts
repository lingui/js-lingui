import { createLocaleTest, createSamples, fillRange, renameKeys } from "./plural_samples"

describe("Plural samples generation util", () => {
    test.each([
        [{"pluralRule-count-zero": null}, {zero: null}],
        [{"pluralRule-count-one": null}, {one: null}],
        [{"pluralRule-count-two": null}, {two: null}],
        [{"pluralRule-count-few": null}, {few: null}],
        [{"pluralRule-count-many": null}, {many: null}],
        [{"pluralRule-count-other": null}, {other: null}],
    ])("renameKeys", (original, expected) => {
        expect(renameKeys(original)).toEqual(expected)
    })

    test("renameKeys multiple", () => {
        const original = {
            "pluralRule-count-zero": "n = 0 @integer 0 @decimal 0.0, 0.00, 0.000, 0.0000",
            "pluralRule-count-one": "n = 1 @integer 1 @decimal 1.0, 1.00, 1.000, 1.0000",
            "pluralRule-count-two": "n = 2 @integer 2 @decimal 2.0, 2.00, 2.000, 2.0000",
            "pluralRule-count-few": "n % 100 = 3..10 @integer 3~10, 103~110, 1003, … @decimal 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0, …",
            "pluralRule-count-many": "n % 100 = 11..99 @integer 11~26, 111, 1011, … @decimal 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0, …",
            "pluralRule-count-other": " @integer 100~102, 200~202, 300~302, 400~402, 500~502, 600, 1000, 10000, 100000, 1000000, … @decimal 0.1~0.9, 1.1~1.7, 10.1, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …"
        }
        expect(renameKeys(original)).toEqual({
            "zero": "n = 0 @integer 0 @decimal 0.0, 0.00, 0.000, 0.0000",
            "one": "n = 1 @integer 1 @decimal 1.0, 1.00, 1.000, 1.0000",
            "two": "n = 2 @integer 2 @decimal 2.0, 2.00, 2.000, 2.0000",
            "few": "n % 100 = 3..10 @integer 3~10, 103~110, 1003, … @decimal 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0, …",
            "many": "n % 100 = 11..99 @integer 11~26, 111, 1011, … @decimal 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0, …",
            "other": " @integer 100~102, 200~202, 300~302, 400~402, 500~502, 600, 1000, 10000, 100000, 1000000, … @decimal 0.1~0.9, 1.1~1.7, 10.1, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …"
        })
    })



    test.each([
        ["0~1", [0, 1]],
        ["2~19", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]],
        ["100~102", [100, 101, 102]],
    ])("fillRange - integer ranges", (range, values) => {
        expect(fillRange(range)).toEqual(values)
    })

    test.each([
        ["0.0~1.0", [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]],
        // partials
        ["0.4~1.6", [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]],
        ["0.04~0.09", [0.04, 0.05, 0.06, 0.07, 0.08, 0.09]],
        ["0.04~0.29", [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29]],
    ])("fillRange - decimal ranges", (range, values) => {
        expect(fillRange(range)).toEqual(values)
    })


    test("createSamples - single values", () => {
        expect(createSamples("0")).toEqual([0])
        expect(createSamples("0, 1, 2")).toEqual([0, 1, 2])
        expect(createSamples("0, 1.0, 2.0")).toEqual([0, 1, 2])
    })

    test("createSamples - integer ranges", () => {
        expect(createSamples("0~1")).toEqual([0, 1])
        expect(createSamples("0~2")).toEqual([0, 1, 2])
        expect(createSamples("0~10")).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        expect(createSamples("2~17, 100, 1000, 10000, 100000, 1000000")).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 100, 1000, 10000, 100000, 1000000])
    })

    test("createSamples - mixed src", () => {
        expect(createSamples("0.1~0.9")).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
        // with ...
        expect(createSamples("0, 2~16, 100, 1000, 10000, 100000, 1000000, …")).toEqual([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 100, 1000, 10000, 100000, 1000000])
        // mixed with integer ranges
        expect(createSamples("0.1~0.9, 1.1~1.7, 10.0, 100.0, 1000.0, 10000.0, 100000.0")).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 10, 100, 1000, 10000, 100000])
        // trailing comma
        expect(createSamples("0.1~0.9, 1.1~1.7, 10.0, 100.0, 1000.0, 10000.0, 100000.0,")).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 10, 100, 1000, 10000, 100000])
    })
})
