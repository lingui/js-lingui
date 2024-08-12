import "@formatjs/intl-locale/polyfill-force";

import "@formatjs/intl-pluralrules/polyfill-force";
import "@formatjs/intl-pluralrules/locale-data/en"; // locale-data for en
import "@formatjs/intl-pluralrules/locale-data/cs"; // locale-data for cs

import React from "react";
import { Text } from "react-native";
import { i18n } from "@lingui/core";
import { I18nProvider, TransRenderProps } from "@lingui/react";

import { messages } from "./src/locales/en/messages.po";

import { Body } from "./src/MainScreen";

i18n.loadAndActivate({ locale: "en", messages });

const DefaultComponent = (props: TransRenderProps) => {
  return <Text>{props.children}</Text>;
};

export default function Root() {
  return (
    <I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
      <Body />
    </I18nProvider>
  );
}
