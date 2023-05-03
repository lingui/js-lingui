import {
	Button as RNButton,
	StyleSheet,
	View,
	Platform,
	ButtonProps,
} from "react-native";
import React from "react";

export const Button = (props: ButtonProps) => (
	<View style={styles.margin}>
		<RNButton {...props} />
	</View>
);

const styles = StyleSheet.create({
	margin: {
		...Platform.select({
			android: {
				margin: 10,
			},
		}),
	},
});
