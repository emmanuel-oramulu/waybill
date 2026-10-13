import { z } from "zod"

export const shortenSchema=z.object({
	url: z
		.url({ protocol: /^https?$/ })
		.max(2048)
		.transform((u) => new URL(u).href),
});

export const codeParamSchema=z.object({
	code: z
		.string()
		.trim()
		.regex(/^[A-Za-z0-9]{7,10}$/,"invalid code")
});