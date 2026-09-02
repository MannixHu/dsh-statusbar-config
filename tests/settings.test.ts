import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, decodeSettings } from '../src/settings.js'

describe('decodeSettings', () => {
  it('accepts a full section', () => {
    expect(decodeSettings({ enabled: true, template: 'TTFT ${ttft}s' }))
      .toEqual({ enabled: true, template: 'TTFT ${ttft}s' })
  })

  it('fills a missing template with the default (pre-template sections keep loading)', () => {
    expect(decodeSettings({ enabled: false })).toEqual({ enabled: false, template: '' })
  })

  it('ignores legacy toggle keys from 0.1-era sections', () => {
    const legacy = { enabled: true, turns: false, steps: false, llmTime: false, toolTime: false, ttft: true, throughput: true, cacheHit: true, inputTokens: true, outputTokens: true }
    expect(decodeSettings(legacy)).toEqual({ enabled: true, template: '' })
  })

  it('rejects non-objects and wrong types', () => {
    expect(decodeSettings(undefined)).toBeUndefined()
    expect(decodeSettings(null)).toBeUndefined()
    expect(decodeSettings('nope')).toBeUndefined()
    expect(decodeSettings([true])).toBeUndefined()
    expect(decodeSettings({ enabled: 'yes' })).toBeUndefined()
    expect(decodeSettings({ enabled: true, template: 42 })).toBeUndefined()
  })

  it('defaults to enabled with no template', () => {
    expect(DEFAULT_SETTINGS).toEqual({ enabled: true, template: '' })
  })
})
