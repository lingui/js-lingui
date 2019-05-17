export default [
  {
    name: "Macro is used in expression assignment",
    input: `
        import { t } from '@lingui/macro';
        const a = t\`Expression assignment\`;
    `,
    expected: `
        const a = 
          /*i18n*/
          {
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
        /*i18n*/
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
        /*i18n*/
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
        /*i18n*/
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
        /*i18n*/
        ({
          id: "Multiline\\nstring"
        });
      `
  },
  {
    name: "Newlines after continuation character are removed",
    filename: "js-t-continuation-character.js"
  }
]
