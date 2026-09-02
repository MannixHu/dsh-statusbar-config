import Schema from "@deepseek-ai/schemastery";
//#region src/settings.ts
/**
* Shared settings contract between the Host half (namespace registration)
* and the browser half (scope binding + card).
*
* The namespace deliberately reuses the historical `status-bar-config` value:
* users migrating from leonardoxr/dsh-status-bar-config keep their existing
* `~/.dsh/settings.yaml` section untouched.
*/
const SETTINGS_NAMESPACE_VALUE = "status-bar-config";
const DEFAULT_SETTINGS = Object.freeze({
	enabled: true,
	turns: true,
	steps: true,
	llmTime: true,
	toolTime: true,
	ttft: true,
	throughput: true,
	cacheHit: true,
	inputTokens: true,
	outputTokens: true
});
//#endregion
//#region src/index.ts
const name = "dsh-statusbar-config";
const Config = Schema.object({
	enabled: Schema.boolean().default(DEFAULT_SETTINGS.enabled).description("Display the configurable statistics row below the composer."),
	turns: Schema.boolean().default(DEFAULT_SETTINGS.turns).description("Show the number of completed conversation turns."),
	steps: Schema.boolean().default(DEFAULT_SETTINGS.steps).description("Show the number of completed agent steps."),
	llmTime: Schema.boolean().default(DEFAULT_SETTINGS.llmTime).description("Show cumulative model wall time."),
	toolTime: Schema.boolean().default(DEFAULT_SETTINGS.toolTime).description("Show cumulative time spent running tools."),
	ttft: Schema.boolean().default(DEFAULT_SETTINGS.ttft).description("Show average time to the first generated token."),
	throughput: Schema.boolean().default(DEFAULT_SETTINGS.throughput).description("Show generated tokens per second."),
	cacheHit: Schema.boolean().default(DEFAULT_SETTINGS.cacheHit).description("Show the prompt cache-hit percentage."),
	inputTokens: Schema.boolean().default(DEFAULT_SETTINGS.inputTokens).description("Show cumulative billed prompt tokens."),
	outputTokens: Schema.boolean().default(DEFAULT_SETTINGS.outputTokens).description("Show cumulative generated tokens.")
});
function apply(ctx, config) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(SETTINGS_NAMESPACE_VALUE, Config, {
			base: config,
			applies: "live"
		});
	});
}
//#endregion
export { Config, apply, name };

//# sourceMappingURL=index.js.map