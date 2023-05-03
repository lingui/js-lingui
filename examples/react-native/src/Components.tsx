import { TextProps, Text } from "react-native";

export const Heading = (props: Omit<TextProps, "style">) => {
  return (
    <Text
      style={{
        fontSize: 20,
        fontWeight: "bold",
      }}
      {...props}
    />
  );
};
