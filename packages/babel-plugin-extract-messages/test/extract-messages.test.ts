import path from "path"
import fs from "fs"
import { transform as babelTransform } from "@babel/core"
import plugin, { ExtractedMessage, ExtractPluginOpts } from "../src/index"
import { mockConsole } from "@lingui/test-utils"
import linguiMacroPlugin, {
  type LinguiPluginOpts,
} from "@lingui/babel-plugin-lingui-macro"
import { getConfig } from "@lingui/conf"

const transform = (filename: string) => {
  const rootDir = path.join(__dirname, "fixtures")
  const filePath = path.join(rootDir, filename)
  const code = fs.readFileSync(filePath).toString()

  return transformCode(code, filePath, rootDir, path.dirname(filePath))
}

const transformCode = (
  code: string,
  filename = "test-case.js",
  rootDir = ".",
  configCwd = path.join(__dirname, "fixtures"),
) => {
  const messages: ExtractedMessage[] = []
  const linguiConfig = getConfig({ cwd: configCwd })

  const pluginOpts: ExtractPluginOpts = {
    linguiConfig,
    onMessageExtracted(msg: ExtractedMessage) {
      const filename = path.relative(rootDir, msg.origin![0])
      messages.push({
        ...msg,
        origin: [filename, msg.origin![1]],
      })
    },
  }

  babelTransform(code, {
    configFile: false,
    filename,
    plugins: [
      "@babel/plugin-syntax-jsx",
      [
        linguiMacroPlugin,
        {
          descriptorFields: "all",
          linguiConfig,
        } satisfies LinguiPluginOpts,
      ],
      [plugin, pluginOpts],
    ],
  })

  return messages
}

function expectNoConsole(cb: () => void) {
  return mockConsole((console) => {
    cb()

    expect(console.warn).not.toBeCalled()
    expect(console.error).not.toBeCalled()
  })
}

describe("@lingui/babel-plugin-extract-messages", function () {
  it("should ignore files without lingui import", () => {
    expectNoConsole(() => {
      const messages = transform("without-lingui.js")
      expect(messages.length).toBe(0)
    })
  })

  it("should extract all messages from JSX files", () => {
    expectNoConsole(() => {
      const messages = transform("jsx-without-macros.js")
      expect(messages).toMatchSnapshot()
    })
  })

  describe("JSX", () => {
    it("Should not rise warning when translation from variable", () => {
      const code = `
import { Trans } from "@lingui/react";

<Trans id={message} />;
<Trans id={message.field} />;
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(0)
      })
    })

    it("Should not rise warning when `key` used with macro", () => {
      const code = `
import { Trans } from "@lingui/react/macro";

<Trans context="Context2" key={1}>
  Some message
</Trans>
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(1)
      })
    })

    it("Should log error when no ID provided", () => {
      const code = `
import { Trans } from "@lingui/react";

<Trans />;
<Trans message="Missing ID" />;
      `
      mockConsole((console) => {
        const messages = transformCode(code)

        expect(messages.length).toBe(0)
        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining(`Missing message ID`),
        )
      })
    })

    it("Should respect runtimeConfigModule.Trans", () => {
      expectNoConsole(() => {
        const messages = transform("custom-runtime/jsx-with-macros.js")
        expect(messages.length).toBe(1)
        expect(messages[0]).toMatchObject({
          id: "custom.runtime",
          message: "Custom runtime",
        })
      })
    })

    it("Should load runtimeConfigModule.Trans fallback", () => {
      const originalConfig = process.env.LINGUI_CONFIG

      process.env.LINGUI_CONFIG = path.join(
        __dirname,
        "fixtures",
        "custom-runtime",
        "lingui.config.js",
      )

      try {
        expectNoConsole(() => {
          const messages: ExtractedMessage[] = []

          babelTransform(
            `
import { MyTrans } from "@my/lingui"

;<MyTrans id="custom.runtime" message="Custom runtime" />
            `,
            {
              configFile: false,
              filename: "test-case.js",
              plugins: [
                "@babel/plugin-syntax-jsx",
                [
                  plugin,
                  {
                    onMessageExtracted(msg: ExtractedMessage) {
                      messages.push(msg)
                    },
                  } satisfies ExtractPluginOpts,
                ],
              ],
            },
          )

          expect(messages.length).toBe(1)
          expect(messages[0]).toMatchObject({
            id: "custom.runtime",
            message: "Custom runtime",
          })
        })
      } finally {
        if (originalConfig === undefined) {
          process.env.LINGUI_CONFIG = undefined
        } else {
          process.env.LINGUI_CONFIG = originalConfig
        }
      }
    })
  })

  describe("CallExpression i18n._()", () => {
    it("should extract messages from i18n._ call expressions", () => {
      expectNoConsole(() => {
        const messages = transform("js-call-expression.js")
        expect(messages).toMatchSnapshot()
      })
    })

    it("should extract from member access expressions", () => {
      const code = `
      // member access
      ctx.i18n._("Message")

      // member access any depth
      ctx.req.i18n._("Message")
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(2)
      })
    })

    it("should not extract from random i18n members", () => {
      const code = `
      i18n.load("Message")
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(0)
      })
    })

    it("should not extract if disabled via annotation", () => {
      const code = `
      /* lingui-extract-ignore */
      i18n._("Message")

      /* lingui-extract-ignore */
      ctx.i18n._("Message")

       /* lingui-extract-ignore */
      ctx.req.i18n._("Message")
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(0)
      })
    })

    it("Should not rise warning when translation from variable", () => {
      const code = `
      i18n._(message);
      // member expression
      i18n._(foo.bar);
      // function call
      i18n._(getMessage());
      `

      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(0)
      })
    })

    it("Should throw error when not a string provided as comment", () => {
      const code = `const msg = i18n._('message.id', {}, {comment: variable})`

      return mockConsole((console) => {
        transformCode(code)

        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining(
            "Only strings or template literals could be extracted.",
          ),
        )
      })
    })

    it("Should support extract id from TplLiteral and Concatenation", () => {
      const code = `
      const msg = i18n._(\`message.id\`);
      const msg2 = i18n._("second" + '.' + "id")
      `

      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages[0]).toMatchObject({
          id: "message.id",
        })
        expect(messages[1]).toMatchObject({
          id: "second.id",
        })
      })
    })

    it("Should support string concatenation", () => {
      const code = `const msg = i18n._('message.id', {}, {comment: "first " + "second " + "third"})`

      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages[0]).toMatchObject({
          comment: "first second third",
        })
      })
    })

    it("Should not double extract from call generated by macro and dont rise warnings", () => {
      const code = `import { i18n } from "@lingui/core";
    const msg =
      i18n._(/**i18n*/
        {
          id: "Hello {name}",
          values: {
            name: name,
          },
        });
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages.length).toBe(1)
      })
    })

    it("Should handle descriptors with object spreads", () => {
      const code = `
      const spread = {};
      i18n.t({ ...spread, id: "x", message: "translation" });
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages).toHaveLength(1)
        expect(messages[0]).toMatchObject({ id: "x", message: "translation" })
      })
    })

    it("Should not warn when id could be provided via spread", () => {
      const code = `
      const lookup = { x: {}, generic: {} };
      i18n._({
        ...(lookup.x ?? lookup.generic),
        values: { val: "test" },
      });
      `
      expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages).toHaveLength(0)
      })
    })
  })

  describe("StringLiteral", () => {
    it("Should extract from marked StringLiteral", () => {
      const code = `const t = /**i18n*/'Message'`

      expectNoConsole(() => {
        const messages = transformCode(code)

        expect(messages[0]).toMatchObject({
          id: "Message",
        })
      })
    })

    it("Should log error when empty StringLiteral marked for extraction", () => {
      const code = `const t = /**i18n*/''`

      return mockConsole((console) => {
        const messages = transformCode(code)

        expect(messages.length).toBe(0)
        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining(`Empty StringLiteral`),
        )
      })
    })
  })

  describe("MessageDescriptor", () => {
    it("should extract messages from MessageDescriptors", () => {
      expectNoConsole(() => {
        const messages = transform("js-message-descriptor.js")
        expect(messages).toMatchSnapshot()
      })
    })

    it("Should extract id from TemplateLiteral", () => {
      const code = "const msg = /**i18n*/{id: `Message`}"

      expectNoConsole(() => {
        const messages = transformCode(code)

        expect(messages[0]).toMatchObject({
          id: "Message",
        })
      })
    })

    it("Should log error if TemplateLiteral in id has expressions", () => {
      const code = "const msg = /**i18n*/{id: `Hello ${name}`}"

      return mockConsole((console) => {
        const messages = transformCode(code)

        expect(messages.length).toBe(0)

        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining(
            `Could not extract from template literal with expressions.`,
          ),
        )
      })
    })

    it("Should log error when no ID provided", () => {
      const code = "const msg = /**i18n*/ {message: `Hello ${name}`}"

      return mockConsole((console) => {
        const messages = transformCode(code)

        expect(messages.length).toBe(0)
        expect(console.error).not.toBeCalled()

        expect(console.warn).toBeCalledWith(
          expect.stringContaining(`Missing message ID`),
        )
      })
    })

    it("Should log error when not a string provided as ID", () => {
      const code = "const msg = /**i18n*/ {id: id}"

      return mockConsole((console) => {
        transformCode(code)

        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining(
            "Only strings or template literals could be extracted.",
          ),
        )
      })
    })

    it("Should log error when not a string provided as comment", () => {
      const code = `const msg =  /**i18n*/ {id: "msg.id", comment: variable}`

      return mockConsole((console) => {
        transformCode(code)

        expect(console.error).not.toBeCalled()
        expect(console.warn).toBeCalledWith(
          expect.stringContaining(
            "Only strings or template literals could be extracted.",
          ),
        )
      })
    })

    it("Should support string concatenation in comment", () => {
      const code = `const msg =  /**i18n*/ {id: "msg.id", comment: "first " + "second " + "third"}`

      return expectNoConsole(() => {
        const messages = transformCode(code)
        expect(messages[0]).toMatchObject({
          comment: "first second third",
        })
      })
    })

    it("Should support /*i18n*/ and /** i18n */ and /**i18n*/ mark formats", () => {
      expectNoConsole(() => {
        const oldFormat = transformCode(
          `const a = /*i18n*/ {id: "old.format", message: "Old"}`,
        )
        expect(oldFormat).toHaveLength(1)
        expect(oldFormat[0]).toMatchObject({ id: "old.format", message: "Old" })

        const newFormat = transformCode(
          `const b = /** i18n */ {id: "new.format", message: "New"}`,
        )
        expect(newFormat).toHaveLength(1)
        expect(newFormat[0]).toMatchObject({ id: "new.format", message: "New" })

        const noSpaces = transformCode(
          `const b = /**i18n*/ {id: "new.format", message: "New"}`,
        )
        expect(noSpaces).toHaveLength(1)
        expect(noSpaces[0]).toMatchObject({ id: "new.format", message: "New" })
      })
    })
  })

  it("should extract all messages from JSX files (macros)", () => {
    return expectNoConsole(() => {
      const messages = transform("jsx-with-macros.js")
      expect(messages).toMatchSnapshot()
    })
  })

  it("should extract Plural messages from JSX files when there's no Trans tag (integration)", () => {
    return expectNoConsole(() => {
      const messages = transform("jsx-without-trans.js")
      expect(messages).toMatchSnapshot()
    })
  })

  it("should extract all messages from JS files (macros)", () => {
    return expectNoConsole(() => {
      const messages = transform("js-with-macros.js")
      expect(messages).toMatchSnapshot()
    })
  })
})
