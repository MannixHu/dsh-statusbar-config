import type { ConversationNode } from './types.js'

/** `(snapshot) => value` selector over an external store hook. */
export type SnapshotSelector<S> = <T>(select: (snapshot: S) => T) => T

export type { ConversationNode, ConversationNodeTiming, SessionStatsProjection, TokenUsageProjection } from './types.js'
