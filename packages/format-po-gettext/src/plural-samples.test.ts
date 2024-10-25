import { renameKeys } from "./plural_samples"

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
})
