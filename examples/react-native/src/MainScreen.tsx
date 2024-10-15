import React, { useState } from "react";
import { StyleSheet, Text, View, Alert, SafeAreaView } from "react-native";
import { Plural, SelectOrdinal, t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { Button } from "./PaddedButton";
import { Heading } from "./Components";

export const Body = React.memo(() => {
  const [messages, setMessages] = useState<string[]>([]);
  const { i18n } = useLingui();

  const markAllAsRead = () => {
    // NOTE - here we're implicitly using the i18n instance that does NOT come from the React context, but from @lingui/core
    // this is because there is nothing that would need to re-render: we're just calling a function and displaying its result in an alert
    Alert.alert("", t`Do you want to set all your messages as read?`, [
      {
        text: t`Yes`,
        onPress: () => {
          setMessages([]);
        },
      },
      {
        text: t`Cancel`,
        style: "cancel",
      },
    ]);
  };

  const loadAndActivateLocale = () => {
    const activeLanguage = i18n.locale;
    const newActiveLanguage = activeLanguage === "en" ? "cs" : "en";
    const catalog =
      newActiveLanguage === "en"
        ? require("./locales/en/messages.po")
        : require("./locales/cs/messages.po");
    i18n.load(newActiveLanguage, catalog.messages);
    i18n.activate(newActiveLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button
        onPress={loadAndActivateLocale}
        title={t`Toggle language to ${i18n.locale === "en" ? "cs" : "en"}`}
      />
      <Inbox
        markAsRead={markAllAsRead}
        messages={messages}
        addMessage={() => {
          setMessages((prevMessages) =>
            prevMessages.concat([`message # ${prevMessages.length + 1}`]),
          );
        }}
      />
    </SafeAreaView>
  );
});

const Inbox = ({
  messages,
  markAsRead,
  addMessage,
}: {
  messages: string[];
  markAsRead: () => void;
  addMessage: () => void;
}) => {
  const messagesCount = messages.length;

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <Trans render={Heading}>Message Inbox</Trans>

        <Button onPress={markAsRead} title={t`Mark messages as read`} />
        <Button onPress={addMessage} title={t`Add a message to your inbox`} />

        <Plural
          value={messagesCount}
          _0="You have no unread messages"
          one="There's # message in your inbox"
          few="There're # messages in your inbox"
          other="There're # messages in your inbox"
        />
        {messages.map((message, index) => {
          const messageIndex = index + 1;
          return (
            <View key={messageIndex} style={{ flexDirection: "row" }}>
              <Text>{message}, </Text>
              <Trans>order: </Trans>
              <SelectOrdinal
                value={messageIndex}
                one="#st message"
                two="#nd message"
                few="#rd message"
                other="#th message"
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  container2: {
    alignItems: "center",
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
