import fs from "fs"
import path from "path"
import { transformFileSync, transform, TransformOptions } from "@babel/core"
import prettier from "prettier"
import { babel } from "@lingui/cli/src/api/extractors"

const testCases = {
  "js-t": [
    {
      name: "Macro is used in expression assignment",
      input: `
        import { t } from '@lingui/macro';
        const a = t\`Expression assignment\`;
    `,
      expected: `
        const a = {
          id: "Expression assignment"
        };
    `
    },
    {
      name: "Variables are replaced with named arguments",
      input: `
        import { t } from '@lingui/macro';
        t\`Variable \${name}\`;
    `,
      expected: `
        ({
          id: "Variable {name}",
          values: {
            name: name
          }
        });
    `
    },
    {
      name: "Variables should be deduplicated",
      input: `
        import { t } from '@lingui/macro';
        t\`\${duplicate} variable \${duplicate}\`;
    `,
      expected: `
        ({
          id: "{duplicate} variable {duplicate}",
          values: {
            duplicate: duplicate
          }
        });
    `
    },
    {
      name:
        "Anything variables except simple identifiers are used as positional arguments",
      input: `
        import { t } from '@lingui/macro';
        t\`
          Property \${props.name},\\
          function \${random()},\\
          array \${array[index]},\\
          constant \${42},\\
          object \${new Date()}\\
          anything \${props.messages[index].value()}
        \`
    `,
      expected: `
        ({
          id: "Property {0}, function {1}, array {2}, constant {3}, object {4} anything {5}",
          values: {
            0: props.name,
            1: random(),
            2: array[index],
            3: 42,
            4: new Date(),
            5: props.messages[index].value()
          }  
        });
    `
    },
    {
      name: "Newlines are preserved",
      input: `
        import { t } from '@lingui/macro';
        t\`Multiline
          string\`
      `,
      expected: `
        ({
          id: "Multiline\\nstring"
        });
      `
    },
    {
      name: "Newlines after continuation character are removed",
      filename: "js-t-continuation-character.js"
    }
  ],
  "js-plural": [
    {
      name: "Macro is used in expression assignment",
      input: `
        import { plural } from '@lingui/macro'
        const a = plural(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
      expected: `
        const a = ({
          id: "{count, plural, one {# book} other {# books}}",
          values: {
            count: count
          }
        });
      `
    },
    {
      name: "Macro with offset and exact matches",
      input: `
        import { plural } from '@lingui/macro'
        plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: "# books"
        });
      `,
      expected: `
        ({
          id: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
          values: {
            0: users.length
          }
        });
      `
    }
  ],
  "js-select": [
    {
      name: "Nested macros",
      input: `
        import { select, plural } from '@lingui/macro'
        select(gender, {
          "male": plural(numOfGuests, {
            one: "He invites one guest",
            other: "He invites # guests"
          }),
          female: \`She is \${gender}\`,
          other: \`They is \${gender}\`
        });
      `,
      expected: `
        ({
          id: "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}",
          values: {
            gender: gender,
            numOfGuests: numOfGuests
          }
        });
      `
    },
    {
      name: "Macro with escaped reserved props",
      input: `
        import { select } from '@lingui/macro'
        select(value, {
          id: 'test escaped id',
          comment: 'test escaped comment'
        })
      `,
      expected: `
        ({
          id: "{value, select, id {test escaped id} comment {test escaped comment}}",
          values: {
            value: value
          }
        });
      `
    }
  ],
  "js-selectOrdinal": [
    {
      input: `
        import { t, selectOrdinal } from '@lingui/macro'
        t\`This is my \${selectOrdinal(count, {
          one: "#st",
          "two": \`#nd\`,
          other: ("#rd")
        })} cat\`
      `,
      expected: `
        ({
          id: "This is my {count, selectordinal, one {#st} two {#nd} other {#rd}} cat",
          values: {
            count: count
          }
        });
      `
    }
  ],
  Trans: [
    {
      name: "Generate ID from children",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>Hello World</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello World" />;
      `
    },
    {
      name: "Generated ID is the same as custom one",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans id="Hello World">Hello World</Trans>;
          `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello World" />;
      `
    },
    {
      name: "Macro with custom ID",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans id="msg.hello">Hello World</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="msg.hello" defaults="Hello World" />;
      `
    },
    {
      name: "Macro without children is noop",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans id={msg} />;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id={msg} />;
      `
    },
    {
      name: "Variables are converted to named arguments",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>Hi {yourName}, my name is {myName}</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hi {yourName}, my name is {myName}" values={{
          yourName: yourName,
          myName: myName,
        }} />;
      `
    },
    {
      name: "Variables are deduplicated",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>{duplicate} variable {duplicate}</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="{duplicate} variable {duplicate}" values={{
          duplicate: duplicate
        }} />;
      `
    },
    {
      name: "Template literals as children",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>{\`How much is \${expression}? \${count}\`}</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="How much is {expression}? {count}" values={{
          expression: expression,
          count: count
        }} />;
      `
    },
    {
      name: "Strings as children are preserved",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>{"hello {count, plural, one {world} other {worlds}}"}</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="hello {count, plural, one {world} other {worlds}}" />;
      `
    },
    {
      name: "Expressions are converted to positional arguments",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>
          Property {props.name},
          function {random()},
          array {array[index]},
          constant {42},
          object {new Date()},
          everything {props.messages[index].value()}
        </Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Property {0}, function {1}, array {2}, constant {3}, object {4}, everything {5}" values={{
          0: props.name,
          1: random(),
          2: array[index],
          3: 42,
          4: new Date(),
          5: props.messages[index].value()
        }} />;
      `
    },
    {
      name: "Elements are replaced with placeholders",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>
          Hello <strong>World!</strong><br />
          <p>
            My name is <a href="/about">{" "}
            <em>{name}</em></a>
          </p>
        </Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello <0>World!</0><1/><2>My name is <3> <4>{name}</4></3></2>" values={{
          name: name
        }} components={{
          0: <strong />,
          1: <br />,
          2: <p />,
          3: <a href="/about" />,
          4: <em />
        }} />;
      `
    },
    {
      name: "Elements inside expression container",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>{<span>Component inside expression container</span>}</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="<0>Component inside expression container</0>" components={{
          0: <span />
        }} />;
      `
    },
    {
      name: "Elements without children",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>{<br />}</Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="<0/>" components={{
          0: <br />
        }} />;
      `
    },
    {
      name: "JSX spread child is noop",
      input: `
        import { Trans } from '@lingui/macro';
        <Trans>{...spread}</Trans>
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans>{...spread}</Trans>
      `
    },
    {
      name: "Production - only essential props are kept",
      production: true,
      input: `
        import { Trans } from '@lingui/macro';
        <Trans id="msg.hello" comment="Hello World">Hello World</Trans> 
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="msg.hello" />;
      `
    },
    {
      input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Strip whitespace around arguments: &quot;
          {name}
          &quot;
        </Trans>
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Strip whitespace around arguments: &quot;{name}&quot;" values={{
          name: name
        }} />;
      `
    },
    {
      input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Strip whitespace around tags, but keep{" "}
          <strong>forced spaces</strong>
          !
        </Trans>
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Strip whitespace around tags, but keep <0>forced spaces</0>!" components={{
          0: <strong />
        }} />;
      `
    },
    {
      input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Keep forced{"\\n"}
          newlines!
        </Trans>
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Keep forced\\n newlines!" />;
      `
    },
    {
      input: `
        import { t, plural, Trans } from '@lingui/macro'
        import i18n from "@lingui/core";
        <Trans>Read <a href="/more" title={i18n._(t\`Full content of \${articleName}\`)}>more</a></Trans>
      `,
      expected: `
        import { Trans } from "@lingui/react";
        import i18n from "@lingui/core";
        <Trans id="Read <0>more</0>" components={{
          0: <a href="/more" title={i18n._({
            id: "Full content of {articleName}",
            values: {
              articleName: articleName
            }
          })} />
        }} />;
      `
    },
    {
      input: `
        import { plural } from '@lingui/macro'
        import i18n from "@lingui/core"
        <a href="/about" title={i18n._(plural(count, {
          one: "# book",
          other: "# books"
        }))}>About</a>
      `,
      expected: `
        import i18n from "@lingui/core";
        
        <a href="/about" title={i18n._({
          id: "{count, plural, one {# book} other {# books}}",
          values: {
            count: count
          }
        })}>About</a>;
      `
    }
  ],
  Select: [
    {
      input: `
        import { Select } from '@lingui/macro';
        <Select
          value={count}
          _male="He"
          _female={\`She\`}
          other={<strong>Other</strong>}
        />;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="{count, select, male {He} female {She} other {<0>Other</0>}}" values={{
          count: count
        }} components={{
          0: <strong />
        }} />;
      `
    },
    {
      input: `
        import { Select } from '@lingui/macro';
        <Select
          id="msg.select"
          render="strong"
          value={user.gender}
          _male="He"
          _female={\`She\`}
          other={<strong>Other</strong>}
        />;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans render="strong" id="msg.select" defaults="{0, select, male {He} female {She} other {<0>Other</0>}}" values={{
          0: user.gender
        }} components={{
          0: <strong />
        }} />;
      `
    }
  ],
  Plural: [
    {
      input: `
        import { Plural } from '@lingui/macro';
        <Plural
          value={count}
          offset="1"
          _0="Zero items"
          few={\`\${count} items\`}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
          count: count
        }} components={{
          0: <a href="/more" />
        }} />;
      `
    },
    {
      input: `
        import { Plural } from '@lingui/macro';
        <Plural
          id="msg.plural"
          render="strong"
          value={count}
          offset="1"
          _0="Zero items"
          few={\`\${count} items\`}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans render="strong" id="msg.plural" defaults="{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}" values={{
          count: count
        }} components={{
          0: <a href="/more" />
        }} />;
      `
    },
    {
      input: `
        import { Trans, Plural } from '@lingui/macro';
        <Trans id="inner-id-removed">
          Looking for{" "}
          <Plural
            value={items.length}
            offset={1}
            _0="zero items"
            few={\`\${items.length} items \${42}\`}
            other={<a href="/more">a lot of them</a>}
          />
        </Trans>
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="inner-id-removed" defaults="Looking for {0, plural, offset:1 =0 {zero items} few {{1} items {2}} other {<0>a lot of them</0>}}" values={{
          0: items.length,
          1: items.length,
          2: 42
        }} components={{
          0: <a href="/more" />
        }} />;
      `
    },
    {
      filename: `jsx-plural-select-nested.js`
    }
  ],
  SelectOrdinal: [
    {
      input: `
        import { Trans, SelectOrdinal } from '@lingui/macro';
        <Trans>
          This is my <SelectOrdinal
            value={count}
            one="#st"
            two={\`#nd\`}
            other={<strong>#rd</strong>}
          /> cat.
        </Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="This is my {count, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat." values={{
          count: count
        }} components={{
          0: <strong />
        }} />;
      `
    },
    {
      input: `
        import { Trans, SelectOrdinal } from '@lingui/macro';
        <Trans>
          This is my <SelectOrdinal
          value={user.numCats}
          one="#st"
          two={\`#nd\`}
          other={<strong>#rd</strong>}
        /> cat.
        </Trans>;
      `,
      expected: `
        import { Trans } from "@lingui/react";
        <Trans id="This is my {0, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat." values={{
          0: user.numCats
        }} components={{
          0: <strong />
        }} />;
      `
    }
  ],

  defineMessages: [
    {
      name: "should expand macros",
      input: `
        import { defineMessages } from '@lingui/macro';
        const messages = defineMessages({
          hello: t\`Hello World\`,
          plural: plural("value", { one: "book", other: "books" })
        })
    `,
      expected: `
        import { Messages } from '@lingui/core';
        const messages = Messages.from({
          hello: 
            /*i18n*/
            "Hello World",
          plural:
            /*i18n*/
            "{value, plural, one {book} other {books}}",
        })
    `
    },
    {
      name: "should expand macros inside descriptor",
      input: `
        import { defineMessages } from '@lingui/macro';
        const messages = defineMessages({
          plural: {
            id: "msg.id",
            comment: "Description",
            message: plural("value", { one: "book", other: "books" })
          }
        })
    `,
      expected: `
        import { Messages } from '@lingui/core';
        const messages = Messages.from({
          plural: 
            /*i18n*/
            {
              id: "msg.id",
              comment: "Description",
              message: "{value, plural, one {book} other {books}}"
            }
        })
    `
    }
  ],

  defineMessage: [
    {
      name: "should expand macros in message property",
      input: `
        import { defineMessage, plural } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          comment: "Description",
          message: plural("value", { one: "book", other: "books" })
        })
    `,
      expected: `
        const message = /*i18n*/
        {
          id: "msg.id",
          comment: "Description",
          message: "{value, plural, one {book} other {books}}"
        }
    `
    },
    {
      name: "should left string message intact",
      input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          comment: "Description",
          message: "Message"
        })
    `,
      expected: `
        const message = /*i18n*/
        {
          id: "msg.id",
          comment: "Description",
          message: "Message"
        }
    `
    },
    {
      name: "should left string message intact - template literal",
      input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          comment: "Description",
          message: \`Message\`
        })
    `,
      expected: `
        const message = /*i18n*/
        {
          id: "msg.id",
          comment: "Description",
          message: \`Message\`
        }
    `
    },
    {
      name: "should use message as id",
      input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          comment: "Description",
          message: \`Message\`
        })
    `,
      expected: `
        const message = /*i18n*/
        {
          comment: "Description",
          id: \`Message\`,
        }
    `
    }
  ]
}

describe("macro", function() {
  const babelOptions: TransformOptions = {
    filename: "<filename>",
    configFile: false,
    plugins: ["@babel/plugin-syntax-jsx", "macros"]
  }

  // return function, so we can test exceptions
  const transformCode = code => () => {
    try {
      return transform(code, babelOptions).code.trim()
    } catch (e) {
      e.message = e.message.replace(/([^:]*:){2}/, "")
      throw e
    }
  }

  Object.keys(testCases).forEach(suiteName => {
    describe(suiteName, () => {
      const cases = testCases[suiteName]

      const clean = value =>
        prettier.format(value, { parser: "babel" }).replace(/\n+/, "\n")

      cases.forEach(
        (
          { name, input, expected, filename, production, only, skip },
          index
        ) => {
          let run = it
          if (only) run = it.only
          if (skip) run = it.skip
          run(name != null ? name : `${suiteName} #${index + 1}`, () => {
            expect(input || filename).toBeDefined()

            const originalEnv = process.env.NODE_ENV

            if (production) {
              process.env.NODE_ENV = "production"
            }

            try {
              if (filename) {
                const inputPath = path.relative(
                  process.cwd(),
                  path.join(__dirname, "fixtures", filename)
                )
                const expectedPath = inputPath.replace(/\.js$/, ".expected.js")
                const expected = fs
                  .readFileSync(expectedPath, "utf8")
                  .replace(/\r/g, "")
                  .trim()

                const actual = transformFileSync(inputPath, babelOptions)
                  .code.replace(/\r/g, "")
                  .trim()
                expect(actual).toEqual(expected)
              } else {
                const actual = transform(input, babelOptions).code.trim()

                expect(clean(actual)).toEqual(clean(expected))
              }
            } finally {
              process.env.NODE_ENV = originalEnv
            }
          })
        }
      )
    })
  })

  describe.skip("validation", function() {
    describe("plural/select/selectordinal", function() {
      it("value is missing", function() {
        const code = `
        plural({
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function() {
        const code = `
        plural({
          offset: count,
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function() {
        const plural = `
        plural({
          value: count
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `
        plural({
          value: count
        });`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        plural({
          value: count
        });`
        expect(transformCode(selectOrdinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms cannot be variables", function() {
        const code = `
        plural({
          value: count,
          [one]: "Book"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function() {
        const plural = `
        plural({
          value: count,
          one: "Book",
          three: "Invalid",
          other: "Books"
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        selectOrdinal({
          value: count,
          one: "st",
          three: "Invalid",
          other: "rd"
        });`
        expect(transformCode(selectOrdinal)).toThrowErrorMatchingSnapshot()
      })
    })

    describe("formats", function() {
      it("value is missing", function() {
        expect(transformCode("date();")).toThrowErrorMatchingSnapshot()
      })

      it("format must be either string, variable or object with custom format", function() {
        expect(transformCode('number(value, "currency");')).not.toThrow()
        expect(transformCode("number(value, currency);")).not.toThrow()
        expect(transformCode("number(value, { digits: 4 });")).not.toThrow()
        expect(
          transformCode("number(value, 42);")
        ).toThrowErrorMatchingSnapshot()
      })
    })

    describe("Plural/Select/SelectOrdinal", function() {
      it("children are not allowed", function() {
        expect(
          transformCode("<Plural>Not allowed</Plural>")
        ).toThrowErrorMatchingSnapshot()
        expect(
          transformCode("<Select>Not allowed</Select>")
        ).toThrowErrorMatchingSnapshot()
        expect(
          transformCode("<SelectOrdinal>Not allowed</SelectOrdinal>")
        ).toThrowErrorMatchingSnapshot()
      })

      it("value is missing", function() {
        const code = `<Plural one="Book" other="Books" />`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function() {
        const variable = `<Plural value={value} offset={offset} one="Book" other="Books" />`
        expect(transformCode(variable)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function() {
        const plural = `<Plural value={value} />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `<Select value={value} />`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function() {
        const plural = `<Plural value={value} three="Invalid" one="Book" other="Books" />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} three="Invalid" one="st" other="rd" />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })
    })

    describe("Date/Number", function() {
      it("value of number must be a variable", function() {
        expect(
          transformCode("<Trans><NumberFormat /></Trans>")
        ).toThrowErrorMatchingSnapshot()
      })

      it("format must be string, variable or object with custom format", function() {
        expect(
          transformCode(
            '<Trans><NumberFormat value={value} format="custom" /></Trans>'
          )
        ).not.toThrow()
        expect(
          transformCode(
            '<Trans><NumberFormat value={value} format={"custom"} /></Trans>'
          )
        ).not.toThrow()
        expect(
          transformCode(
            "<Trans><NumberFormat value={value} format={custom} /></Trans>"
          )
        ).not.toThrow()
        expect(
          transformCode(
            "<Trans><NumberFormat value={value} format={{ digits: 4 }} /></Trans>"
          )
        ).not.toThrow()
        expect(
          transformCode(
            "<Trans><NumberFormat value={value} format={42} /></Trans>"
          )
        ).toThrowErrorMatchingSnapshot()
      })

      it("value of date must be a variable", function() {
        expect(
          transformCode("<Trans><DateFormat /></Trans>")
        ).toThrowErrorMatchingSnapshot()
      })
    })
  })
})
