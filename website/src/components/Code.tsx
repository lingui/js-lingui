import React from "react";
import clsx from "clsx";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import Button from "./Button";

import styles from "./Code.module.scss";

const Code = (): React.ReactElement => {
  const { withBaseUrl } = useBaseUrlUtils();

  const codeSample = `
import { Trans } from "@lingui/macro"

function App() {
  return (
    <Trans id="msg.docs">
      Read the <a href="https://lingui.dev">documentation</a>
      for more info.
    </Trans>
  )
}
`;

  return (
    <section className={clsx(styles.code, "col col--6 col--offset-3")}>
      <div className="container">
        <h2 className={"text--center margin-bottom--lg"}>Integrating Lingui into Your Project is Easy!</h2>
        <CodeBlock className="language-jsx">{codeSample.trim()}</CodeBlock>
      </div>

      <div className={styles.linkExamples}>
        <Button href={withBaseUrl("/tutorials/react")} isOutline={true}>
          More Examples
        </Button>
      </div>
    </section>
  );
};

export default Code;
