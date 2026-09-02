import { Fragment, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { SettingsScopeLike } from './runtime.js'
import type { SessionStatsProjection, TokenUsageProjection, ConversationNode } from './types.js'
import type { SnapshotSelector } from './hooks.js'
import { DEFAULT_SETTINGS, type StatusbarSettings } from '../settings.js'
import type { Translate } from './locales.js'
import { buildStatsGroups, deriveStats } from './stats.js'

export interface DockProps {
  settings: SettingsScopeLike<StatusbarSettings>
  t: Translate
  /** alpha (0.1.2+) passes the chat-store selector hook. */
  useChat?: SnapshotSelector<{ legacy: { nodes: readonly ConversationNode[] } }>
  /** Legacy (rc-era) shells passed the session selector hook instead. */
  useSession?: SnapshotSelector<{ chat: { legacy: { nodes: readonly ConversationNode[] } } }>
  useProjection?: <T>(name: string) => T | undefined
}

export function ConfigurableStatsLine({ settings, t, useChat, useSession, useProjection }: DockProps) {
  const snapshot = useSyncExternalStore(
    listener => settings.subscribe(listener),
    () => settings.getSnapshot(),
    () => settings.getSnapshot(),
  )
  const legacyNodes = useChat
    ? useChat(s => s.legacy.nodes)
    : useSession ? useSession(s => s.chat.legacy.nodes) : []
  const usage = useProjection ? useProjection<TokenUsageProjection | undefined>('tokenUsage') : undefined
  const projectedStats = useProjection ? useProjection<SessionStatsProjection | undefined>('sessionStats') : undefined
  const stats = useMemo(() => projectedStats ?? deriveStats(legacyNodes ?? []), [projectedStats, legacyNodes])
  const groups = buildStatsGroups(stats, usage, snapshot.value ?? DEFAULT_SETTINGS, t)
  const line = groups.join(' | ')
  const rootRef = useRef<HTMLDivElement>(null)
  const [truncated, setTruncated] = useState(false)

  useLayoutEffect(() => {
    const element = rootRef.current
    if (element === null) return
    const measure = () => setTruncated(element.scrollWidth > element.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [line])

  if (groups.length === 0) return null
  return <div
    ref={rootRef}
    className="dsc-stats"
    data-dsh-statusbar-config="true"
    title={truncated ? line : undefined}
    aria-label={line}
  >
    {groups.map((group, index) => <Fragment key={group}>
      {index > 0 && <span className="dsc-stats-separator" aria-hidden="true">|</span>}
      <span>{group}</span>
    </Fragment>)}
  </div>
}
