import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

export const getIsomorphicHeaders = createIsomorphicFn()
	.server(async () => {
		return getHeaders();
	})
	.client(() => {
		return {};
	});
