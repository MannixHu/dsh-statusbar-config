import { useRef, useState, useSyncExternalStore } from 'react'
import type { SettingsScopeLike } from './runtime.js'
import { DEFAULT_SETTINGS, type StatusbarSettings } from '../settings.js'
import type { Translate } from './locales.js'

export interface SettingsCardProps {
  settings: SettingsScopeLike<StatusbarSettings>
  t: Translate
}

/** Clickable variable chips, most-useful first. */
const VARIABLES = ['ttft', 'tps', 'cache', 'input', 'output', 'turns', 'steps', 'llm', 'tool'] as const

type Notice = { kind: 'success' | 'error'; text: string } | undefined

export function StatusbarSettingsCard({ settings, t }: SettingsCardProps) {
  const snapshot = useSyncExternalStore(
    listener => settings.subscribe(listener),
    () => settings.getSnapshot(),
    () => settings.getSnapshot(),
  )
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'enabled' | 'template' | 'reset'>()
  const [notice, setNotice] = useState<Notice>()
  /** Local draft while editing; null = show the stored value. */
  const [draft, setDraft] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const stored = snapshot.value ?? DEFAULT_SETTINGS
  const shown = draft ?? stored.template
  const writable = snapshot.status === 'ready' && snapshot.writable

  const update = async (key: 'enabled' | 'template', next: boolean | string) => {
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

  const commitTemplate = async () => {
    if (draft === null) return
    const value = draft
    setDraft(null)
    if (value === stored.template) return
    await update('template', value)
  }

  /** Clamp the tooltip inside the card so it never clips at either dialog edge. */
  const positionTip = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    const chip = event.currentTarget
    const anchor = chip.closest('.dsc-card')
    if (anchor === null) return
    const tipWidth = parseFloat(getComputedStyle(chip, '::after').width)
    if (!Number.isFinite(tipWidth) || tipWidth <= 0) return
    const chipRect = chip.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    const lower = anchorRect.left - chipRect.left
    const upper = anchorRect.right - chipRect.left - tipWidth - 8
    const left = Math.max(lower, Math.min(0, upper))
    chip.style.setProperty('--tip-left', `${Math.round(left)}px`)
  }

  const insertVariable = (name: string) => {
    const token = '${' + name + '}'
    const input = inputRef.current
    const base = draft ?? stored.template
    if (input === null) { setDraft(base + token); return }
    const start = input.selectionStart ?? base.length
    const end = input.selectionEnd ?? base.length
    setDraft(base.slice(0, start) + token + base.slice(end))
    requestAnimationFrame(() => {
      input.focus()
      const caret = start + token.length
      input.setSelectionRange(caret, caret)
    })
  }

  const reset = async () => {
    setBusy('reset')
    setNotice(undefined)
    setDraft(null)
    try {
      for (const key of ['enabled', 'template'] as const) await settings.unset(key)
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
      <div className="dsc-row">
        <label className="dsc-copy">
          <span className="dsc-label">{t('card.enabled')}</span>
          <span className="dsc-hint">{t('card.enabledHint')}</span>
        </label>
        <span className="dsc-toggle">
          <input
            type="checkbox"
            checked={stored.enabled}
            disabled={!writable || busy !== undefined}
            onChange={event => { void update('enabled', event.currentTarget.checked) }}
          />
          <span className="dsc-switch" aria-hidden="true" />
        </span>
      </div>
      <div className="dsc-row dsc-template-row">
        <div className="dsc-copy">
          <input
            ref={inputRef}
            type="text"
            className="dsc-input"
            value={shown}
            placeholder={t('card.templateExample')}
            spellCheck={false}
            disabled={!writable || busy !== undefined}
            onChange={event => setDraft(event.currentTarget.value)}
            onBlur={() => { void commitTemplate() }}
            onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}
          />
          <div className="dsc-chips" role="group" aria-label={t('card.chipsLabel')}>
            {VARIABLES.map(name => <button
              key={name}
              type="button"
              className="dsc-chip"
              data-tip={t(`var.${name}`)}
              aria-label={`\${${name}} — ${t(`var.${name}`)}`}
              onMouseEnter={positionTip}
              onFocus={positionTip}
              disabled={!writable || busy !== undefined}
              onClick={() => insertVariable(name)}
            >{` \${${name}}`}</button>)}
          </div>
          <span className="dsc-hint">{t('card.templateSave')}</span>
        </div>
      </div>
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
