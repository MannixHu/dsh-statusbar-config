/**
 * Host half: register the durable settings namespace.
 *
 * Uses the runtime `ctx.inject(['settings'], ...)` seam (the same pattern the
 * shipped ui-chat plugin uses) so activation never blocks when no settings
 * provider exists.
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import Schema from '@deepseek-ai/schemastery'
import { DEFAULT_SETTINGS, SETTINGS_NAMESPACE_VALUE, type StatusbarSettings } from './settings.js'

export const name = 'dsh-statusbar-config'

export type Config = StatusbarSettings

export const Config: Schema<Config> = Schema.object({
  enabled: Schema.boolean().default(DEFAULT_SETTINGS.enabled).description('Display the configurable statistics row below the composer.'),
  turns: Schema.boolean().default(DEFAULT_SETTINGS.turns).description('Show the number of completed conversation turns.'),
  steps: Schema.boolean().default(DEFAULT_SETTINGS.steps).description('Show the number of completed agent steps.'),
  llmTime: Schema.boolean().default(DEFAULT_SETTINGS.llmTime).description('Show cumulative model wall time.'),
  toolTime: Schema.boolean().default(DEFAULT_SETTINGS.toolTime).description('Show cumulative time spent running tools.'),
  ttft: Schema.boolean().default(DEFAULT_SETTINGS.ttft).description('Show average time to the first generated token.'),
  throughput: Schema.boolean().default(DEFAULT_SETTINGS.throughput).description('Show generated tokens per second.'),
  cacheHit: Schema.boolean().default(DEFAULT_SETTINGS.cacheHit).description('Show the prompt cache-hit percentage.'),
  inputTokens: Schema.boolean().default(DEFAULT_SETTINGS.inputTokens).description('Show cumulative billed prompt tokens.'),
  outputTokens: Schema.boolean().default(DEFAULT_SETTINGS.outputTokens).description('Show cumulative generated tokens.'),
})

export function apply(ctx: Context, config: Config): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(SETTINGS_NAMESPACE_VALUE, Config, {
      base: config,
      applies: 'live',
    })
  })
}
