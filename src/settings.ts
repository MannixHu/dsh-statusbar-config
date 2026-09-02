/**
 * Shared settings contract between the Host half (namespace registration)
 * and the browser half (scope binding + card).
 *
 * The namespace deliberately reuses the historical `status-bar-config` value
 * so pre-template sections in `~/.dsh/settings.yaml` keep loading (unknown
 * legacy keys are ignored).
 */
export const SETTINGS_NAMESPACE_VALUE = 'status-bar-config'

export interface StatusbarSettings {
  enabled: boolean
  /** Display template using `${variable}` placeholders; empty = default row. */
  template: string
}

export const DEFAULT_SETTINGS: Readonly<StatusbarSettings> = Object.freeze({
  enabled: true,
  template: '',
})

/**
 * Narrow one wire section to the exact settings shape; undefined rejects the
 * section so the consumer falls back to defaults. Unknown keys (legacy toggle
 * names from pre-template versions) are ignored; a missing `template`
 * resolves to its default.
 */
export function decodeSettings(value: unknown): StatusbarSettings | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  if (typeof record.enabled !== 'boolean') return undefined
  if (record.template !== undefined && typeof record.template !== 'string') return undefined
  return {
    enabled: record.enabled,
    template: typeof record.template === 'string' ? record.template : DEFAULT_SETTINGS.template,
  }
}
