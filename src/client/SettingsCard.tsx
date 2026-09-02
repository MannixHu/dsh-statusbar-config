import { useState, useSyncExternalStore } from 'react'
import type { SettingsScopeLike } from './runtime.js'
import { DEFAULT_SETTINGS, SETTING_KEYS, type SettingKey, type StatusbarSettings } from '../settings.js'
import type { Translate, TranslationKey } from './locales.js'

export interface SettingsCardProps {
  settings: SettingsScopeLike<StatusbarSettings>
  t: Translate
}

const SEGMENTS: ReadonlyArray<{ key: Exclude<SettingKey, 'enabled'>; labelKey: TranslationKey; hintKey: TranslationKey }> = [
  { key: 'turns', labelKey: 'card.turns', hintKey: 'card.turnsHint' },
  { key: 'steps', labelKey: 'card.steps', hintKey: 'card.stepsHint' },
  { key: 'llmTime', labelKey: 'card.llmTime', hintKey: 'card.llmTimeHint' },
  { key: 'toolTime', labelKey: 'card.toolTime', hintKey: 'card.toolTimeHint' },
  { key: 'ttft', labelKey: 'card.ttft', hintKey: 'card.ttftHint' },
  { key: 'throughput', labelKey: 'card.throughput', hintKey: 'card.throughputHint' },
  { key: 'cacheHit', labelKey: 'card.cacheHit', hintKey: 'card.cacheHitHint' },
  { key: 'inputTokens', labelKey: 'card.inputTokens', hintKey: 'card.inputTokensHint' },
  { key: 'outputTokens', labelKey: 'card.outputTokens', hintKey: 'card.outputTokensHint' },
]

type Notice = { kind: 'success' | 'error'; text: string } | undefined

function ToggleRow({
  checked,
  description,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  disabled: boolean
  label: string
  onChange(value: boolean): void
}) {
  return <label className="dsc-row" data-disabled={disabled || undefined}>
    <span className="dsc-copy">
      <span className="dsc-label">{label}</span>
      <span className="dsc-hint">{description}</span>
    </span>
    <span className="dsc-toggle">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={event => onChange(event.currentTarget.checked)} />
      <span className="dsc-switch" aria-hidden="true" />
    </span>
  </label>
}

export function StatusbarSettingsCard({ settings, t }: SettingsCardProps) {
  const snapshot = useSyncExternalStore(
    listener => settings.subscribe(listener),
    () => settings.getSnapshot(),
    () => settings.getSnapshot(),
  )
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<SettingKey | 'reset'>()
  const [notice, setNotice] = useState<Notice>()
  const value = snapshot.value ?? DEFAULT_SETTINGS
  const writable = snapshot.status === 'ready' && snapshot.writable

  const update = async (key: SettingKey, next: boolean) => {
    setBusy(key)
    setNotice(undefined)
    try {
      await settings.set(key, next)
      setNotice({ kind: 'success', text: t('card.saved') })
    } catch (cause) {
      setNotice({ kind: 'error', text: cause instanceof Error ? cause.message : String(cause) })
    } finally {
      setBusy(undefined)
    }
  }

  const reset = async () => {
    setBusy('reset')
    setNotice(undefined)
    try {
      for (const key of SETTING_KEYS) await settings.unset(key)
      setNotice({ kind: 'success', text: t('card.resetDone') })
    } catch (cause) {
      setNotice({ kind: 'error', text: cause instanceof Error ? cause.message : String(cause) })
    } finally {
      setBusy(undefined)
    }
  }

  const statusText = notice?.text
    ?? (snapshot.status === 'loading'
      ? t('card.loading')
      : snapshot.status === 'ready'
        ? (snapshot.writable ? t('card.live') : t('card.readonly'))
        : t('card.unavailable'))

  return <li className="dsc-card" data-open={open}>
    <button
      type="button"
      className="dsc-card-header"
      aria-expanded={open}
      onClick={() => setOpen(current => !current)}
    >
      <span className="dsc-card-heading">
        <span className="dsc-card-title">{t('card.title')}</span>
        <span className="dsc-card-description">{t('card.description')}</span>
      </span>
      <svg className="dsc-card-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {open && <div className="dsc-card-body">
      <ToggleRow
        checked={value.enabled}
        disabled={!writable || busy !== undefined}
        label={t('card.enabled')}
        description={t('card.enabledHint')}
        onChange={next => { void update('enabled', next) }}
      />
      {SEGMENTS.map(option => <ToggleRow
        key={option.key}
        checked={value[option.key]}
        disabled={!writable || busy !== undefined}
        label={t(option.labelKey)}
        description={t(option.hintKey)}
        onChange={next => { void update(option.key, next) }}
      />)}
      <div className="dsc-footer">
        <span className="dsc-footer-copy">
          <span
            className="dsc-status"
            data-kind={notice?.kind}
            role={notice?.kind === 'error' ? 'alert' : 'status'}
            aria-live={notice?.kind === 'error' ? 'assertive' : 'polite'}
          >{statusText}</span>
        </span>
        <button
          type="button"
          className="dsc-button"
          disabled={!writable || busy !== undefined}
          onClick={() => { void reset() }}
        >{t('card.reset')}</button>
      </div>
    </div>}
  </li>
}
