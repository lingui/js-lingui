import React from "react";

import styles from "./PartnerBanner.module.scss";

const PartnerBanner = (): React.ReactElement => {
  return (
    <section className={styles.Partner}>
      <div className="container text--center">
        <a
          href={"https://crowdin.com/?utm_source=lingui.dev&utm_medium=referral&utm_campaign=lingui.dev"}
          target={"_blank"}
          rel="noreferrer"
        >
          <p className="text--center text--uppercase">Presented By</p>
          <div>
            <img
              className="margin-bottom--sm"
              alt="Crowdin"
              src="https://support.crowdin.com/assets/logos/core-logo/png/crowdin-core-logo-cDark.png#gh-light-mode-only"
              width="auto"
              height="32px"
            />
            <img
              className="margin-bottom--sm"
              alt="Crowdin"
              src="https://support.crowdin.com/assets/logos/core-logo/png/crowdin-core-logo-cWhite.png#gh-dark-mode-only"
              width="auto"
              height="32px"
            />
            <p className="text--secondary">Agile localization for tech companies</p>
          </div>
        </a>
      </div>
    </section>
  );
};

export default PartnerBanner;
