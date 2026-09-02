/**
 * Shared settings contract between the Host half (namespace registration)
 * and the browser half (scope binding + card).
 *
 * The namespace deliberately reuses the historical `status-bar-config` value:
 * users migrating from leonardoxr/dsh-status-bar-config keep their existing
 * `~/.dsh/settings.yaml` section untouched.
 */
export const SETTINGS_NAMESPACE_VALUE = 'status-bar-config'

export interface StatusbarSettings {
  enabled: boolean
  turns: boolean
  steps: boolean
  llmTime: boolean
  toolTime: boolean
  ttft: boolean
  throughput: boolean
  cacheHit: boolean
  inputTokens: boolean
  outputTokens: boolean
}

export const SETTING_KEYS = [
  'enabled',
  'turns',
  'steps',
  'llmTime',
  'toolTime',
  'ttft',
  'throughput',
  'cacheHit',
  'inputTokens',
  'outputTokens',
] as const satisfies readonly (keyof StatusbarSettings)[]

export type SettingKey = (typeof SETTING_KEYS)[number]

export const DEFAULT_SETTINGS: Readonly<StatusbarSettings> = Object.freeze({
  enabled: true,
  turns: true,
  steps: true,
  llmTime: true,
  toolTime: true,
  ttft: true,
  throughput: true,
  cacheHit: true,
  inputTokens: true,
  outputTokens: true,
})

/**
 * Narrow one wire section to the exact settings shape; undefined rejects the
 * section so the consumer falls back to defaults.
 */
export function decodeSettings(value: unknown): StatusbarSettings | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  for (const key of SETTING_KEYS) if (typeof record[key] !== 'boolean') return undefined
  return Object.fromEntries(SETTING_KEYS.map(key => [key, record[key]])) as unknown as StatusbarSettings
}
