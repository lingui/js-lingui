import React from "react";
import Button from "./Button";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

const Workflow = (): React.ReactElement => {
  const { withBaseUrl } = useBaseUrlUtils();

  return (
    <section className="margin-top--xl">
      <div className="container">
        <h2 className="text--center margin-bottom--sm">Workflow</h2>
        <img alt="Workflow scheme" src={"./img/docs/lingui-workflow.svg"} />
      </div>
      <div className="text--center">
        <Button href={withBaseUrl("/introduction#workflow")} isOutline={true}>
          Read More
        </Button>
      </div>
    </section>
  );
};

export default Workflow;
