window.__ModuleLoader__.load({
	id: "dsh-statusbar-config",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		const SETTING_KEYS = [
			"enabled",
			"turns",
			"steps",
			"llmTime",
			"toolTime",
			"ttft",
			"throughput",
			"cacheHit",
			"inputTokens",
			"outputTokens"
		];
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
		/**
		* Narrow one wire section to the exact settings shape; undefined rejects the
		* section so the consumer falls back to defaults.
		*/
		function decodeSettings(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
			const record = value;
			for (const key of SETTING_KEYS) if (typeof record[key] !== "boolean") return void 0;
			return Object.fromEntries(SETTING_KEYS.map((key) => [key, record[key]]));
		}
		//#endregion
		//#region src/client/SettingsCard.tsx
		const SEGMENTS = [
			{
				key: "turns",
				labelKey: "card.turns",
				hintKey: "card.turnsHint"
			},
			{
				key: "steps",
				labelKey: "card.steps",
				hintKey: "card.stepsHint"
			},
			{
				key: "llmTime",
				labelKey: "card.llmTime",
				hintKey: "card.llmTimeHint"
			},
			{
				key: "toolTime",
				labelKey: "card.toolTime",
				hintKey: "card.toolTimeHint"
			},
			{
				key: "ttft",
				labelKey: "card.ttft",
				hintKey: "card.ttftHint"
			},
			{
				key: "throughput",
				labelKey: "card.throughput",
				hintKey: "card.throughputHint"
			},
			{
				key: "cacheHit",
				labelKey: "card.cacheHit",
				hintKey: "card.cacheHitHint"
			},
			{
				key: "inputTokens",
				labelKey: "card.inputTokens",
				hintKey: "card.inputTokensHint"
			},
			{
				key: "outputTokens",
				labelKey: "card.outputTokens",
				hintKey: "card.outputTokensHint"
			}
		];
		function ToggleRow({ checked, description, disabled, label, onChange }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "dsc-row",
				"data-disabled": disabled || void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "dsc-copy",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsc-label",
						children: label
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsc-hint",
						children: description
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "dsc-toggle",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked,
						disabled,
						onChange: (event) => onChange(event.currentTarget.checked)
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsc-switch",
						"aria-hidden": "true"
					})]
				})]
			});
		}
		function StatusbarSettingsCard({ settings, t }) {
			const snapshot = (0, react.useSyncExternalStore)((listener) => settings.subscribe(listener), () => settings.getSnapshot(), () => settings.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)();
			const [notice, setNotice] = (0, react.useState)();
			const value = snapshot.value ?? DEFAULT_SETTINGS;
			const writable = snapshot.status === "ready" && snapshot.writable;
			const update = async (key, next) => {
				setBusy(key);
				setNotice(void 0);
				try {
					await settings.set(key, next);
					setNotice({
						kind: "success",
						text: t("card.saved")
					});
				} catch (cause) {
					setNotice({
						kind: "error",
						text: cause instanceof Error ? cause.message : String(cause)
					});
				} finally {
					setBusy(void 0);
				}
			};
			const reset = async () => {
				setBusy("reset");
				setNotice(void 0);
				try {
					for (const key of SETTING_KEYS) await settings.unset(key);
					setNotice({
						kind: "success",
						text: t("card.resetDone")
					});
				} catch (cause) {
					setNotice({
						kind: "error",
						text: cause instanceof Error ? cause.message : String(cause)
					});
				} finally {
					setBusy(void 0);
				}
			};
			const statusText = notice?.text ?? (snapshot.status === "loading" ? t("card.loading") : snapshot.status === "ready" ? snapshot.writable ? t("card.live") : t("card.readonly") : t("card.unavailable"));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: "dsc-card",
				"data-open": open,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dsc-card-header",
					"aria-expanded": open,
					onClick: () => setOpen((current) => !current),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsc-card-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsc-card-title",
							children: t("card.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsc-card-description",
							children: t("card.description")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						className: "dsc-card-chevron",
						viewBox: "0 0 16 16",
						fill: "none",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
							d: "m4 6 4 4 4-4",
							stroke: "currentColor",
							strokeWidth: "1.5",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						})
					})]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsc-card-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleRow, {
							checked: value.enabled,
							disabled: !writable || busy !== void 0,
							label: t("card.enabled"),
							description: t("card.enabledHint"),
							onChange: (next) => {
								update("enabled", next);
							}
						}),
						SEGMENTS.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleRow, {
							checked: value[option.key],
							disabled: !writable || busy !== void 0,
							label: t(option.labelKey),
							description: t(option.hintKey),
							onChange: (next) => {
								update(option.key, next);
							}
						}, option.key)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsc-footer",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsc-footer-copy",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsc-status",
									"data-kind": notice?.kind,
									role: notice?.kind === "error" ? "alert" : "status",
									"aria-live": notice?.kind === "error" ? "assertive" : "polite",
									children: statusText
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsc-button",
								disabled: !writable || busy !== void 0,
								onClick: () => {
									reset();
								},
								children: t("card.reset")
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		const LOCALE_NAMESPACE = "dsh-statusbar-config";
		const en = {
			"stats.counts": "{turns} turns · {steps} steps",
			"stats.turns": "{turns} turns",
			"stats.steps": "{steps} steps",
			"stats.llm": "LLM {duration}",
			"stats.toolCall": "Tool call {duration}",
			"stats.ttftAverage": "TTFT avg {duration}",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "Cache hit {percent}%",
			"stats.tokens": "Input {input} tok · Output {output} tok",
			"stats.inputTokens": "Input {input} tok",
			"stats.outputTokens": "Output {output} tok",
			"card.title": "Conversation statistics",
			"card.description": "Choose which measurements appear below the composer.",
			"card.enabled": "Show statistics row",
			"card.enabledHint": "Display the statistics strip below the composer. Individual choices are preserved when hidden.",
			"card.turns": "Turns",
			"card.turnsHint": "Show the number of completed conversation turns.",
			"card.steps": "Steps",
			"card.stepsHint": "Show the number of completed agent steps.",
			"card.llmTime": "LLM time",
			"card.llmTimeHint": "Show cumulative model wall time.",
			"card.toolTime": "Tool-call time",
			"card.toolTimeHint": "Show cumulative time spent running tools.",
			"card.ttft": "Average TTFT",
			"card.ttftHint": "Show average time to the first generated token.",
			"card.throughput": "Decode throughput",
			"card.throughputHint": "Show generated tokens per second.",
			"card.cacheHit": "Cache hit",
			"card.cacheHitHint": "Show the prompt cache-hit percentage.",
			"card.inputTokens": "Input tokens",
			"card.inputTokensHint": "Show cumulative billed prompt tokens.",
			"card.outputTokens": "Output tokens",
			"card.outputTokensHint": "Show cumulative generated tokens.",
			"card.saved": "Saved. The statistics row updated immediately.",
			"card.resetDone": "Restored the default statistics.",
			"card.loading": "Loading settings…",
			"card.live": "Changes apply immediately.",
			"card.readonly": "Settings are read-only in this runtime.",
			"card.unavailable": "The conversation statistics settings namespace is unavailable.",
			"card.reset": "Restore defaults"
		};
		const zh = {
			"stats.counts": "{turns} 轮 · {steps} 步",
			"stats.turns": "{turns} 轮",
			"stats.steps": "{steps} 步",
			"stats.llm": "LLM {duration}",
			"stats.toolCall": "工具调用 {duration}",
			"stats.ttftAverage": "首 token 平均 {duration}",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "缓存命中 {percent}%",
			"stats.tokens": "输入 {input} tok · 输出 {output} tok",
			"stats.inputTokens": "输入 {input} tok",
			"stats.outputTokens": "输出 {output} tok",
			"card.title": "会话统计",
			"card.description": "选择对话输入框下方显示哪些统计项。",
			"card.enabled": "显示统计行",
			"card.enabledHint": "在输入框下方显示统计条。隐藏时各项开关设置保持不变。",
			"card.turns": "轮数",
			"card.turnsHint": "显示已完成的对话轮数。",
			"card.steps": "步数",
			"card.stepsHint": "显示已完成的 agent 步数。",
			"card.llmTime": "LLM 时间",
			"card.llmTimeHint": "显示模型累计耗时。",
			"card.toolTime": "工具调用时间",
			"card.toolTimeHint": "显示工具运行的累计耗时。",
			"card.ttft": "首 token 平均用时",
			"card.ttftHint": "显示首 token 生成的平均耗时。",
			"card.throughput": "解码速度",
			"card.throughputHint": "显示每秒生成的 token 数。",
			"card.cacheHit": "缓存命中",
			"card.cacheHitHint": "显示提示词缓存命中率。",
			"card.inputTokens": "输入 token",
			"card.inputTokensHint": "显示累计计费输入 token。",
			"card.outputTokens": "输出 token",
			"card.outputTokensHint": "显示累计生成的 token。",
			"card.saved": "已保存，统计行已即时更新。",
			"card.resetDone": "已恢复默认统计配置。",
			"card.loading": "正在加载设置…",
			"card.live": "更改即时生效。",
			"card.readonly": "当前运行时中设置为只读。",
			"card.unavailable": "会话统计设置命名空间不可用。",
			"card.reset": "恢复默认"
		};
		//#endregion
		//#region src/client/stats.ts
		function formatTokens(value) {
			const scaled = (item) => item >= 100 ? String(Math.round(item)) : String(Math.round(item * 10) / 10);
			if (value < 1e3) return String(value);
			if (value < 1e6) return `${scaled(value / 1e3)}K`;
			return `${scaled(value / 1e6)}M`;
		}
		function formatDuration(ms) {
			const seconds = ms / 1e3;
			if (seconds < 60) return `${Math.round(seconds * 10) / 10}s`;
			const whole = Math.round(seconds);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		function formatTokensPerSecond(value) {
			const clamped = Math.max(0, value);
			return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
		}
		function billedInputTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		function roundedIntegerPercent(cacheReadTokens, denominator) {
			const denominatorQuotient = Math.floor(denominator / 200);
			const denominatorRemainder = denominator % 200;
			let lower = 0;
			let upper = 100;
			while (lower < upper) {
				const candidate = Math.floor((lower + upper + 1) / 2);
				const factor = candidate * 2 - 1;
				if (cacheReadTokens >= factor * denominatorQuotient + Math.ceil(factor * denominatorRemainder / 200)) lower = candidate;
				else upper = candidate - 1;
			}
			return lower;
		}
		function cacheHitPercent(usage) {
			const denominator = billedInputTokens(usage);
			if (denominator === 0) return null;
			const missedInputTokens = usage.uncachedInputTokens + usage.cacheWriteTokens;
			if (missedInputTokens === 0) return "100";
			const integerPercent = roundedIntegerPercent(usage.cacheReadTokens, denominator);
			if (integerPercent < 100) return String(integerPercent);
			let decimalPlaces = 1;
			let scaledDoubleGap = missedInputTokens * 200;
			const denominatorTens = Math.floor(denominator / 10);
			while (scaledDoubleGap <= denominatorTens) {
				scaledDoubleGap *= 10;
				decimalPlaces += 1;
			}
			const denominatorOnes = denominator % 10;
			let roundedLoss = 5;
			for (let loss = 1; loss < 5; loss += 1) {
				const factor = loss * 2 + 1;
				const threshold = factor * denominatorTens + Math.floor(factor * denominatorOnes / 10);
				if (scaledDoubleGap <= threshold) {
					roundedLoss = loss;
					break;
				}
			}
			return `99.${"9".repeat(decimalPlaces - 1)}${10 - roundedLoss}`;
		}
		function usageOutputTokens(usage) {
			if (typeof usage !== "object" || usage === null) return null;
			const value = usage.outputTokens;
			return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
		}
		/**
		* Fold assistant and tool-result nodes into window-scoped display totals —
		* the FALLBACK for assemblies without the `sessionStats` projection.
		*/
		function deriveStats(nodes) {
			const turns = /* @__PURE__ */ new Set();
			let steps = 0;
			let llmMs = 0;
			let toolMs = 0;
			let ttftMs = 0;
			let ttftSteps = 0;
			let decodeMs = 0;
			let decodeTokens = 0;
			for (const node of nodes) {
				if (node.kind === "tool-result") {
					if (node.callTime != null) toolMs += Math.max(0, node.time - node.callTime);
					continue;
				}
				if (node.kind !== "assistant") continue;
				turns.add(node.turn);
				steps += 1;
				const timing = node.timing;
				if (timing !== void 0 && timing.stepStartTime !== null) llmMs += Math.max(0, timing.completedTime - timing.stepStartTime);
				if (timing !== void 0 && timing.stepStartTime !== null && timing.firstTokenTime !== null) {
					ttftMs += Math.max(0, timing.firstTokenTime - timing.stepStartTime);
					ttftSteps += 1;
				}
				const outputTokens = usageOutputTokens(node.usage);
				if (timing !== void 0 && timing.firstTokenTime !== null && outputTokens !== null) {
					decodeMs += Math.max(0, timing.completedTime - timing.firstTokenTime);
					decodeTokens += outputTokens;
				}
			}
			return {
				turns: turns.size,
				steps,
				llmMs,
				toolMs,
				ttftMs,
				ttftSteps,
				decodeMs,
				decodeTokens
			};
		}
		/** Compose the display groups from the toggles; empty when the row is hidden. */
		function buildStatsGroups(stats, usage, settings, t) {
			if (!settings.enabled) return [];
			const groups = [];
			if (stats !== void 0 && stats.steps > 0) {
				if (settings.turns && settings.steps) groups.push(t("stats.counts", {
					turns: stats.turns,
					steps: stats.steps
				}));
				else if (settings.turns) groups.push(t("stats.turns", { turns: stats.turns }));
				else if (settings.steps) groups.push(t("stats.steps", { steps: stats.steps }));
				const durations = [];
				if (settings.llmTime && stats.llmMs > 0) durations.push(t("stats.llm", { duration: formatDuration(stats.llmMs) }));
				if (settings.toolTime && stats.toolMs > 0) durations.push(t("stats.toolCall", { duration: formatDuration(stats.toolMs) }));
				if (durations.length > 0) groups.push(durations.join(" · "));
				const speeds = [];
				if (settings.ttft && stats.ttftSteps > 0) speeds.push(t("stats.ttftAverage", { duration: formatDuration(stats.ttftMs / stats.ttftSteps) }));
				if (settings.throughput && stats.decodeMs > 0) speeds.push(t("stats.tokensPerSecond", { throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)) }));
				if (speeds.length > 0) groups.push(speeds.join(" · "));
			}
			if (usage !== void 0 && (billedInputTokens(usage) > 0 || usage.outputTokens > 0)) {
				if (settings.cacheHit) {
					const cacheHit = cacheHitPercent(usage);
					if (cacheHit !== null) groups.push(t("stats.cacheHit", { percent: cacheHit }));
				}
				const input = formatTokens(billedInputTokens(usage));
				const output = formatTokens(usage.outputTokens);
				if (settings.inputTokens && settings.outputTokens) groups.push(t("stats.tokens", {
					input,
					output
				}));
				else if (settings.inputTokens) groups.push(t("stats.inputTokens", { input }));
				else if (settings.outputTokens) groups.push(t("stats.outputTokens", { output }));
			}
			return groups;
		}
		//#endregion
		//#region src/client/StatsLine.tsx
		function ConfigurableStatsLine({ settings, t, useChat, useSession, useProjection }) {
			const snapshot = (0, react.useSyncExternalStore)((listener) => settings.subscribe(listener), () => settings.getSnapshot(), () => settings.getSnapshot());
			const legacyNodes = useChat ? useChat((s) => s.legacy.nodes) : useSession ? useSession((s) => s.chat.legacy.nodes) : [];
			const usage = useProjection ? useProjection("tokenUsage") : void 0;
			const projectedStats = useProjection ? useProjection("sessionStats") : void 0;
			const groups = buildStatsGroups((0, react.useMemo)(() => projectedStats ?? deriveStats(legacyNodes ?? []), [projectedStats, legacyNodes]), usage, snapshot.value ?? DEFAULT_SETTINGS, t);
			const line = groups.join(" | ");
			const rootRef = (0, react.useRef)(null);
			const [truncated, setTruncated] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				const element = rootRef.current;
				if (element === null) return;
				const measure = () => setTruncated(element.scrollWidth > element.clientWidth);
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(element);
				return () => observer.disconnect();
			}, [line]);
			if (groups.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: "dsc-stats",
				"data-dsh-statusbar-config": "true",
				title: truncated ? line : void 0,
				"aria-label": line,
				children: groups.map((group, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [index > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsc-stats-separator",
					"aria-hidden": "true",
					children: "|"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: group })] }, group))
			});
		}
		//#endregion
		//#region src/client/styles.ts
		const STYLE_ID = "dsh-statusbar-config/styles";
		const styles = `
.dsc-stats{box-sizing:border-box;display:block;width:100%;max-width:var(--dsh-chat-content-width);margin:0 auto;padding:4px calc(var(--dsh-composer-side-clearance) + 16px) 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px;text-align:center;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsc-stats-separator{color:var(--dsw-alias-separator-primary);margin:0 10px}
.dsc-card{box-sizing:border-box;width:100%;list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);transition:border-color .16s,background .16s}
.dsc-card:hover{border-color:var(--dsw-alias-label-dimmed)}
.dsc-card[data-open=true]{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}
.dsc-card-header{appearance:none;box-sizing:border-box;width:100%;border:0;border-radius:12px;background:transparent;color:inherit;display:flex;align-items:center;gap:12px;padding:14px 16px;text-align:left;font:inherit;cursor:pointer}
.dsc-card-header:focus-visible,.dsc-toggle input:focus-visible+.dsc-switch,.dsc-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsc-card-heading{display:flex;min-width:0;flex:1;flex-direction:column;gap:4px}
.dsc-card-title{font-size:15px;line-height:1.4;font-weight:600}
.dsc-card-description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}
.dsc-card-chevron{width:16px;height:16px;color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}
.dsc-card[data-open=true] .dsc-card-chevron{transform:rotate(180deg)}
.dsc-card-body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding:4px 0 8px}
.dsc-row{display:flex;align-items:center;gap:14px;padding:12px 0}
.dsc-row+.dsc-row{border-top:1px solid var(--dsw-alias-border-l2)}
.dsc-row[data-disabled=true]{opacity:.5}
.dsc-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:2px}
.dsc-label{font-size:13px;line-height:1.5;font-weight:500}
.dsc-hint,.dsc-status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}
.dsc-status[data-kind=error]{color:var(--dsw-alias-label-error)}
.dsc-status[data-kind=success]{color:var(--dsw-alias-state-success-primary)}
.dsc-toggle{position:relative;display:inline-flex;flex:none;cursor:pointer}
.dsc-toggle input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.dsc-switch{box-sizing:border-box;width:34px;height:20px;border-radius:999px;background:var(--dsw-alias-border-l1);padding:2px;transition:background .16s}
.dsc-switch::after{content:'';display:block;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv1);transition:transform .16s}
.dsc-toggle input:checked+.dsc-switch{background:var(--dsw-alias-brand-primary)}
.dsc-toggle input:checked+.dsc-switch::after{transform:translateX(14px)}
.dsc-toggle input:disabled+.dsc-switch{cursor:default}
.dsc-footer{border-top:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 0 4px}
.dsc-footer-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:2px}
.dsc-button{appearance:none;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:1.5;padding:5px 14px;cursor:pointer}
.dsc-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsc-button:disabled{opacity:.4;cursor:default}
`;
		//#endregion
		//#region src/client/index.tsx
		const PLUGIN_ID = "dsh-statusbar-config";
		const inject = [
			"slots",
			"settingsScope",
			"locale"
		];
		function installStyles() {
			document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)?.remove();
			const tag = document.createElement("style");
			tag.dataset.plugin = PLUGIN_ID;
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = styles;
			document.head.append(tag);
			return () => tag.remove();
		}
		function apply(ctx) {
			ctx.effect(installStyles, "dsh-statusbar-config: styles");
			ctx.effect(() => ctx.locale.register(LOCALE_NAMESPACE, {
				zh,
				en
			}), "dsh-statusbar-config: locale");
			const settings = ctx.settingsScope.bind({
				namespace: SETTINGS_NAMESPACE_VALUE,
				decode: decodeSettings
			});
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				key: SETTINGS_NAMESPACE_VALUE,
				locale: LOCALE_NAMESPACE,
				inject: () => ({ settings })
			}, StatusbarSettingsCard));
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "stats",
				order: 0,
				priority: -1,
				locale: LOCALE_NAMESPACE,
				inject: () => ({ settings })
			}, ConfigurableStatsLine));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map