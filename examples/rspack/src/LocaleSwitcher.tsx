import { useState } from "react";
import { useLingui } from "@lingui/react";

import { dynamicActivate } from "./i18n";
import Locale from "./locales";

function LocaleSwitcher() {
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);

  const handleLocaleChange = async (newLocale: Locale) => {
    if (isLoading || newLocale === i18n.locale) {
      return;
    }

    setIsLoading(true);

    try {
      await dynamicActivate(i18n, newLocale);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        disabled={isLoading || i18n.locale === Locale.ENGLISH}
        onClick={() => void handleLocaleChange(Locale.ENGLISH)}
      >
        English
      </button>
      <button
        disabled={isLoading || i18n.locale === Locale.FRENCH}
        onClick={() => void handleLocaleChange(Locale.FRENCH)}
      >
        Français
      </button>
    </div>
  );
}

export default LocaleSwitcher;
