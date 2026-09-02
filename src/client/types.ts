/**
 * Structural types for the alpha client graph. Deliberately local: the
 * packages that used to export these (`dsh-client-runtime`, `dsh-client-ui-slots`)
 * were folded back into the shell in 0.1.2-alpha, and a plugin bundle must not
 * require packages that are not graph rows.
 */

/** Durable whole-log session statistics projection served by the Host. */
export interface SessionStatsProjection {
  turns: number
  steps: number
  llmMs: number
  toolMs: number
  ttftMs: number
  ttftSteps: number
  decodeMs: number
  decodeTokens: number
}

/** Session token-usage projection served by the Host. */
export interface TokenUsageProjection {
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

/** Minimal shapes of the chat-node window used by the fallback fold. */
export interface ConversationNodeTiming {
  stepStartTime: number | null
  firstTokenTime: number | null
  completedTime: number
}

export interface ConversationNode {
  kind: string
  turn: number
  time: number
  callTime?: number | null
  timing?: ConversationNodeTiming
  usage?: { outputTokens?: unknown }
}

/** `(snapshot) => value` selector over an external store hook. */
export type SnapshotSelector<S> = <T>(select: (snapshot: S) => T) => T
