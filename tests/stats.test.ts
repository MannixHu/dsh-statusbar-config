import { describe, expect, it } from 'vitest'
import {
  ALL_SEGMENTS,
  buildStatsGroups,
  cacheHitPercent,
  deriveStats,
  formatSecondsNumber,
  renderTemplate,
} from '../src/client/stats.js'
import type { ConversationNode, SessionStatsProjection, TokenUsageProjection } from '../src/client/types.js'

const stats: SessionStatsProjection = {
  turns: 12, steps: 34, llmMs: 192_000, toolMs: 68_000,
  ttftMs: 12 * 580, ttftSteps: 12, decodeMs: 100_000, decodeTokens: 6_900,
}

const usage: TokenUsageProjection = {
  uncachedInputTokens: 4_400_000, cacheReadTokens: 59_300_000, cacheWriteTokens: 0, outputTokens: 178_000,
}

const t = (key: string, params?: Record<string, unknown>) =>
  key + (params ? ':' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join(',') : '')

describe('renderTemplate', () => {
  it('substitutes every variable and keeps units literal', () => {
    const out = renderTemplate('首 token 平均 ${ttft}s · ${tps} tok/s | 缓存命中 ${cache}% | 输入 ${input} tok · 输出 ${output} tok', stats, usage)
    expect(out).toBe('首 token 平均 0.6s · 69 tok/s | 缓存命中 93% | 输入 63.7M tok · 输出 178K tok')
  })

  it('renders counts and durations with their own units', () => {
    expect(renderTemplate('${turns}轮/${steps}步 LLM ${llm} 工具 ${tool}', stats, usage))
      .toBe('12轮/34步 LLM 3m12s 工具 1m8s')
  })

  it('keeps unknown placeholders verbatim', () => {
    expect(renderTemplate('x${nope}y', stats, usage)).toBe('x${nope}y')
  })

  it('renders empty for variables without data', () => {
    expect(renderTemplate('[${ttft}][${cache}]', { ...stats, ttftSteps: 0 }, { ...usage, uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }))
      .toBe('[][]')
  })
})

describe('formatSecondsNumber', () => {
  it('keeps one decimal under a minute', () => {
    expect(formatSecondsNumber(580)).toBe('0.6')
    expect(formatSecondsNumber(45_200)).toBe('45.2')
  })
  it('switches to integer seconds from a minute up', () => {
    expect(formatSecondsNumber(102_000)).toBe('102')
  })
})

describe('cacheHitPercent', () => {
  it('returns null with no billed input', () => {
    expect(cacheHitPercent({ uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 1 })).toBeNull()
  })
  it('returns 100 on a full hit', () => {
    expect(cacheHitPercent({ uncachedInputTokens: 0, cacheReadTokens: 500, cacheWriteTokens: 0, outputTokens: 1 })).toBe('100')
  })
})

describe('deriveStats (window fallback)', () => {
  it('folds assistant steps and tool-result wall time', () => {
    const nodes: ConversationNode[] = [
      { kind: 'user', turn: 1, time: 0 },
      { kind: 'assistant', turn: 1, time: 3_000, timing: { stepStartTime: 0, firstTokenTime: 500, completedTime: 3_000 }, usage: { outputTokens: 40 } },
      { kind: 'tool-result', turn: 1, time: 9_000, callTime: 3_000 },
      { kind: 'assistant', turn: 2, time: 12_000, timing: { stepStartTime: 9_000, firstTokenTime: 9_400, completedTime: 12_000 }, usage: { outputTokens: 60 } },
    ]
    const out = deriveStats(nodes)
    expect(out).toEqual({
      turns: 2, steps: 2, llmMs: 6_000, toolMs: 6_000,
      ttftMs: 900, ttftSteps: 2, decodeMs: 5_100, decodeTokens: 100,
    })
  })
})

describe('buildStatsGroups (default segments)', () => {
  it('mirrors the official groups with ALL_SEGMENTS', () => {
    const groups = buildStatsGroups(stats, usage, ALL_SEGMENTS, t)
    expect(groups).toHaveLength(5)
    expect(groups[0]).toContain('turns=12')
    expect(groups[2]).toContain('0.6s')
    expect(groups[3]).toContain('93')
    expect(groups[4]).toContain('63.7M')
  })
  it('emits nothing before any step or token', () => {
    const empty: SessionStatsProjection = { turns: 0, steps: 0, llmMs: 0, toolMs: 0, ttftMs: 0, ttftSteps: 0, decodeMs: 0, decodeTokens: 0 }
    expect(buildStatsGroups(empty, undefined, ALL_SEGMENTS, t)).toEqual([])
  })
})
