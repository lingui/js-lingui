import { i18n } from "@lingui/core";
import {
	createStartHandler,
	defaultStreamHandler,
	requestHandler,
} from "@tanstack/react-start/server";
import { setupLocaleFromRequest } from "~/modules/lingui/i18n.server";
import { createRouter } from "./router";

export default requestHandler(async (ctx) => {
	await setupLocaleFromRequest(i18n);

	const startHandler = createStartHandler({
		createRouter: () => {
			return createRouter({ i18n });
		},
	});

	return startHandler(defaultStreamHandler)(ctx);
});
