import { describe } from "vitest"
import { makeConfig } from "@lingui/conf"
import { macroTester } from "./macroTester"

describe.skip("", () => {})

macroTester({
  cases: [
    {
      name: "tagged template literal style",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;
}
    `,
    },
    {
      name: "support renamed destructuring",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t: _ } = useLingui();
  const a = _\`Text\`;
}
    `,
    },
    {
      name: "should process macro with  matching name in correct scopes",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;

  {
    // here is child scope with own "t" binding, shouldn't be processed
    const t = () => {};
    t\`Text\`;
  }
  {
    // here is child scope which should be processed, since 't' relates to outer scope
    t\`Text\`;
  }
}
    `,
    },
    {
      name: "inserted statement should not clash with existing variables",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const _t = "i'm here";
  const { t: _ } = useLingui();
  const a = _\`Text\`;
}
    `,
    },
    {
      name: "support nested macro",
      code: `
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text \${plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: "# books"
        })}\`;
}

    `,
    },
    {
      name: "support message descriptor",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t({ message: "Hello", context: "my custom" });
}
    `,
    },
    {
      name: "support a variable",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t(msg);
}
    `,
    },
    {
      name: "does not crash when no params",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t();
}
    `,
    },
    {
      name: "support passing t variable as dependency",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = useMemo(() => t\`Text\`, [t]);
}
    `,
    },
    {
      name: "transform to standard useLingui statement",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { i18n, t } = useLingui();

  console.log(i18n);
  const a = t\`Text\`;
}
    `,
    },
    {
      name: "support i18n export",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { i18n } = useLingui();

  console.log(i18n);
}
    `,
    },
    {
      name: "work with existing useLingui statement",
      code: `
import { useLingui as useLinguiMacro } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();

  console.log(_);
  const { t } = useLinguiMacro();
  const a = t\`Text\`;
}
    `,
    },

    {
      name: "work with renamed existing useLingui statement",
      code: `
import { useLingui as useLinguiRenamed  } from '@lingui/react';
import { useLingui as useLinguiMacro } from '@lingui/react/macro';

function MyComponent() {
  const { _ } = useLinguiRenamed();

  console.log(_);
  const { t } = useLinguiMacro();
  const a = t\`Text\`;
}
    `,
    },
    {
      name: "should not break on function currying",
      code: `
  import { useLingui } from '@lingui/core/macro';

  const result = curryingFoo()()
  console.log('curryingFoo', result)
    `,
    },
    {
      name: "work with multiple react components",
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;
}

function MyComponent2() {
  const { t } = useLingui();
  const b = t\`Text\`;
}`,
    },
    {
      name: "support configuring runtime module import using LinguiConfig.runtimeConfigModule",
      macroOpts: {
        linguiConfig: makeConfig(
          {
            runtimeConfigModule: {
              useLingui: ["@my/lingui-react", "myUselingui"],
            },
          },
          { skipValidation: true }
        ),
      },
      code: `
import { useLingui } from '@lingui/react/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;
}
`,
    },
  ],
})
