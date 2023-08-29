import React from "react";
import { createRoot } from "react-dom/client";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "./locales/en/messages";
import { messages as frMessages } from "./locales/fr/messages";

import Inbox from "./Inbox";

i18n.load({
  "en": enMessages,
  "fr": frMessages,
});

i18n.activate("en");

const App = () => (
  <I18nProvider i18n={i18n}>
    <Inbox />
  </I18nProvider>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
