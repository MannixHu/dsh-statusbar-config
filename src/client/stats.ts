/**
 * Formatting and folding logic — a faithful port of the shipped StatsLine
 * math (dsh-client-ui-chat), kept field-compatible with the rc-era plugin so
 * behavior is unchanged when segments are toggled on.
 */
import type { ConversationNode, SessionStatsProjection, TokenUsageProjection } from './types.js'
import type { StatusbarSettings } from '../settings.js'
import type { StatsTranslate } from './locales.js'

export function formatTokens(value: number): string {
  const scaled = (item: number) => item >= 100 ? String(Math.round(item)) : String(Math.round(item * 10) / 10)
  if (value < 1_000) return String(value)
  if (value < 1_000_000) return `${scaled(value / 1_000)}K`
  return `${scaled(value / 1_000_000)}M`
}

export function formatDuration(ms: number): string {
  const seconds = ms / 1_000
  if (seconds < 60) return `${Math.round(seconds * 10) / 10}s`
  const whole = Math.round(seconds)
  return `${Math.floor(whole / 60)}m${whole % 60}s`
}

export function formatTokensPerSecond(value: number): string {
  const clamped = Math.max(0, value)
  return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10)
}

export function billedInputTokens(usage: TokenUsageProjection): number {
  return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
}

function roundedIntegerPercent(cacheReadTokens: number, denominator: number): number {
  const denominatorQuotient = Math.floor(denominator / 200)
  const denominatorRemainder = denominator % 200
  let lower = 0
  let upper = 100
  while (lower < upper) {
    const candidate = Math.floor((lower + upper + 1) / 2)
    const factor = candidate * 2 - 1
    if (cacheReadTokens >= factor * denominatorQuotient + Math.ceil(factor * denominatorRemainder / 200)) lower = candidate
    else upper = candidate - 1
  }
  return lower
}

export function cacheHitPercent(usage: TokenUsageProjection): string | null {
  const denominator = billedInputTokens(usage)
  if (denominator === 0) return null
  const missedInputTokens = usage.uncachedInputTokens + usage.cacheWriteTokens
  if (missedInputTokens === 0) return '100'
  const integerPercent = roundedIntegerPercent(usage.cacheReadTokens, denominator)
  if (integerPercent < 100) return String(integerPercent)
  let decimalPlaces = 1
  let scaledDoubleGap = missedInputTokens * 200
  const denominatorTens = Math.floor(denominator / 10)
  while (scaledDoubleGap <= denominatorTens) {
    scaledDoubleGap *= 10
    decimalPlaces += 1
  }
  const denominatorOnes = denominator % 10
  let roundedLoss = 5
  for (let loss = 1; loss < 5; loss += 1) {
    const factor = loss * 2 + 1
    const threshold = factor * denominatorTens + Math.floor(factor * denominatorOnes / 10)
    if (scaledDoubleGap <= threshold) {
      roundedLoss = loss
      break
    }
  }
  return `99.${'9'.repeat(decimalPlaces - 1)}${10 - roundedLoss}`
}

function usageOutputTokens(usage: unknown): number | null {
  if (typeof usage !== 'object' || usage === null) return null
  const value = (usage as Record<string, unknown>).outputTokens
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/**
 * Fold assistant and tool-result nodes into window-scoped display totals —
 * the FALLBACK for assemblies without the `sessionStats` projection.
 */
export function deriveStats(nodes: readonly ConversationNode[]): SessionStatsProjection {
  const turns = new Set<number>()
  let steps = 0
  let llmMs = 0
  let toolMs = 0
  let ttftMs = 0
  let ttftSteps = 0
  let decodeMs = 0
  let decodeTokens = 0

  for (const node of nodes) {
    if (node.kind === 'tool-result') {
      if (node.callTime != null) toolMs += Math.max(0, node.time - node.callTime)
      continue
    }
    if (node.kind !== 'assistant') continue
    turns.add(node.turn)
    steps += 1
    const timing = node.timing
    if (timing !== undefined && timing.stepStartTime !== null) {
      llmMs += Math.max(0, timing.completedTime - timing.stepStartTime)
    }
    if (timing !== undefined && timing.stepStartTime !== null && timing.firstTokenTime !== null) {
      ttftMs += Math.max(0, timing.firstTokenTime - timing.stepStartTime)
      ttftSteps += 1
    }
    const outputTokens = usageOutputTokens(node.usage)
    if (timing !== undefined && timing.firstTokenTime !== null && outputTokens !== null) {
      decodeMs += Math.max(0, timing.completedTime - timing.firstTokenTime)
      decodeTokens += outputTokens
    }
  }

  return { turns: turns.size, steps, llmMs, toolMs, ttftMs, ttftSteps, decodeMs, decodeTokens }
}

/** Compose the display groups from the toggles; empty when the row is hidden. */
export function buildStatsGroups(
  stats: SessionStatsProjection | undefined,
  usage: TokenUsageProjection | undefined,
  settings: StatusbarSettings,
  t: StatsTranslate,
): string[] {
  if (!settings.enabled) return []
  const groups: string[] = []

  if (stats !== undefined && stats.steps > 0) {
    if (settings.turns && settings.steps) groups.push(t('stats.counts', { turns: stats.turns, steps: stats.steps }))
    else if (settings.turns) groups.push(t('stats.turns', { turns: stats.turns }))
    else if (settings.steps) groups.push(t('stats.steps', { steps: stats.steps }))

    const durations: string[] = []
    if (settings.llmTime && stats.llmMs > 0) durations.push(t('stats.llm', { duration: formatDuration(stats.llmMs) }))
    if (settings.toolTime && stats.toolMs > 0) durations.push(t('stats.toolCall', { duration: formatDuration(stats.toolMs) }))
    if (durations.length > 0) groups.push(durations.join(' · '))

    const speeds: string[] = []
    if (settings.ttft && stats.ttftSteps > 0) speeds.push(t('stats.ttftAverage', { duration: formatDuration(stats.ttftMs / stats.ttftSteps) }))
    if (settings.throughput && stats.decodeMs > 0) {
      speeds.push(t('stats.tokensPerSecond', { throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1_000)) }))
    }
    if (speeds.length > 0) groups.push(speeds.join(' · '))
  }

  if (usage !== undefined && (billedInputTokens(usage) > 0 || usage.outputTokens > 0)) {
    if (settings.cacheHit) {
      const cacheHit = cacheHitPercent(usage)
      if (cacheHit !== null) groups.push(t('stats.cacheHit', { percent: cacheHit }))
    }
    const input = formatTokens(billedInputTokens(usage))
    const output = formatTokens(usage.outputTokens)
    if (settings.inputTokens && settings.outputTokens) groups.push(t('stats.tokens', { input, output }))
    else if (settings.inputTokens) groups.push(t('stats.inputTokens', { input }))
    else if (settings.outputTokens) groups.push(t('stats.outputTokens', { output }))
  }

  return groups
}
