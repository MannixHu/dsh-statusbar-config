import Schema from "@deepseek-ai/schemastery";
//#region src/settings.ts
/**
* Shared settings contract between the Host half (namespace registration)
* and the browser half (scope binding + card).
*
* The namespace deliberately reuses the historical `status-bar-config` value
* so pre-template sections in `~/.dsh/settings.yaml` keep loading (unknown
* legacy keys are ignored).
*/
const SETTINGS_NAMESPACE_VALUE = "status-bar-config";
const DEFAULT_SETTINGS = Object.freeze({
	enabled: true,
	template: ""
});
//#endregion
//#region src/index.ts
const name = "dsh-statusbar-config";
const Config = Schema.object({
	enabled: Schema.boolean().default(DEFAULT_SETTINGS.enabled).description("Display the configurable statistics row below the composer."),
	template: Schema.string().default(DEFAULT_SETTINGS.template).role("textarea").description("Display template with ${variable} placeholders; empty = default statistics row. Variables: ${turns} ${steps} ${llm} ${tool} ${ttft} ${tps} ${cache} ${input} ${output}.")
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