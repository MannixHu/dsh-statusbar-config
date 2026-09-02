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
  template: Schema.string().default(DEFAULT_SETTINGS.template).role('textarea').description('Display template with ${variable} placeholders; empty = default statistics row. Variables: ${turns} ${steps} ${llm} ${tool} ${ttft} ${tps} ${cache} ${input} ${output}.'),
})

export function apply(ctx: Context, config: Config): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(SETTINGS_NAMESPACE_VALUE, Config, {
      base: config,
      applies: 'live',
    })
  })
}
