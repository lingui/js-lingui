import { TestCase } from "./index"
import { makeConfig } from "@lingui/conf"

const cases: TestCase[] = [
  {
    name: "tagged template literal style",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;
}
    `,
    expected: `
import { useLingui } from "@lingui/react";

function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: \"xeiujy\",
      message: \"Text\",
    }
  );
}`,
  },
  {
    name: "support renamed destructuring",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { t: _ } = useLingui();
  const a = _\`Text\`;
}
    `,
    expected: `
import { useLingui } from "@lingui/react";

function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: \"xeiujy\",
      message: \"Text\",
    }
  );
}`,
  },
  {
    name: "should process macro with  matching name in correct scopes",
    input: `
import { useLingui } from '@lingui/macro';

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
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
  {
    // here is child scope with own "t" binding, shouldn't be processed
    const t = () => {};
    t\`Text\`;
  }
  {
    // here is child scope which should be processed, since 't' relates to outer scope
    _t(
      /*i18n*/
      {
        id: "xeiujy",
        message: "Text",
      }
    );
  }
}

`,
  },
  {
    name: "inserted statement should not clash with existing variables",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const _t = "i'm here";
  const { t: _ } = useLingui();
  const a = _\`Text\`;
}
    `,
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const _t = "i'm here";
  const { _: _t2 } = useLingui();
  const a = _t2(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
`,
  },
  {
    name: "support nested macro",
    input: `
import { useLingui, plural } from '@lingui/macro';

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
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: "hJRCh6",
      message:
        "Text {0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
      values: {
        0: users.length,
      },
    }
  );
}
`,
  },
  {
    name: "support message descriptor",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t({ message: "Hello", context: "my custom" });
}
    `,
    expected: `
    import { useLingui } from "@lingui/react";
    function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      context: "my custom",
      message: "Hello",
      id: "BYqAaU",
    }
  );
}`,
  },
  {
    name: "support passing t variable as dependency",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = useMemo(() => t\`Text\`, [t]);
}
    `,
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _: _t } = useLingui();
  const a = useMemo(
    () =>
      _t(
        /*i18n*/
        {
          id: "xeiujy",
          message: "Text",
        }
      ),
    [_t]
  );
}
`,
  },
  {
    name: "transform to standard useLingui statement",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { i18n, t } = useLingui();

  console.log(i18n);
  const a = t\`Text\`;
}
    `,
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { i18n, _: _t } = useLingui();
  console.log(i18n);
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
`,
  },
  {
    name: "work with existing useLingui statement",
    input: `
import { useLingui as useLinguiMacro } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();

  console.log(_);
  const { t } = useLinguiMacro();
  const a = t\`Text\`;
}
    `,
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _ } = useLingui();
  console.log(_);
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
`,
  },

  {
    // todo: implement this
    skip: true,
    name: "work with renamed existing useLingui statement",
    input: `
import { useLingui as useLinguiMacro } from '@lingui/macro';
import { useLingui as useLinguiRenamed  } from '@lingui/react';

function MyComponent() {
  const { _ } = useLinguiRenamed();

  console.log(_);
  const { t } = useLinguiMacro();
  const a = t\`Text\`;
}
    `,
    expected: `
import { useLingui as useLinguiRenamed  } from '@lingui/react';
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _ } = useLinguiRenamed();
  console.log(_);
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
`,
  },
  {
    name: "work with multiple react components",
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;
}

function MyComponent2() {
  const { t } = useLingui();
  const b = t\`Text\`;
}`,
    expected: `
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
function MyComponent2() {
  const { _: _t } = useLingui();
  const b = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
`,
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
    input: `
import { useLingui } from '@lingui/macro';

function MyComponent() {
  const { t } = useLingui();
  const a = t\`Text\`;
}
`,
    expected: `
import { myUselingui } from "@my/lingui-react";
function MyComponent() {
  const { _: _t } = myUselingui();
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
`,
  },
]

export default cases
