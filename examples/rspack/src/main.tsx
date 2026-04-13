import React from "react";
import { i18n, } from "@lingui/core";
import { createRoot } from "react-dom/client";

import { I18nProvider } from "@lingui/react";

import Inbox from "./Inbox";
import { dynamicActivate } from "./i18n";
import Locale from "./locales";

const container = document.getElementById("root");
const root = createRoot(container!);

void dynamicActivate(i18n, Locale.ENGLISH)
  .then(() => {
    root.render(
      <React.StrictMode>
        <I18nProvider i18n={i18n}>
          <Inbox />
        </I18nProvider>
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    console.error("Failed to load initial catalog.", error);
  });
