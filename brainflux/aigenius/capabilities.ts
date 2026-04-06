export interface AgentCapabilities {
  canAnswerProtocolQuestions: boolean
  canAnswerTokenQuestions: boolean
  canDescribeTooling: boolean
  canReportEcosystemNews: boolean
  canExplainValidators?: boolean
  canHandleStakingTopics?: boolean
}

export interface AgentFlags {
  requiresExactInvocation: boolean
  noAdditionalCommentary: boolean
  forwardUnknownTopics?: boolean
  enforceStrictFormatting?: boolean
}

export const SOLANA_AGENT_CAPABILITIES: AgentCapabilities = {
  canAnswerProtocolQuestions: true,
  canAnswerTokenQuestions: true,
  canDescribeTooling: true,
  canReportEcosystemNews: true,
  canExplainValidators: true,
  canHandleStakingTopics: true,
}

export const SOLANA_AGENT_FLAGS: AgentFlags = {
  requiresExactInvocation: true,
  noAdditionalCommentary: true,
  forwardUnknownTopics: true,
  enforceStrictFormatting: true,
}

/* ---------------- Utility checkers ---------------- */

export function hasCapability(
  capability: keyof AgentCapabilities,
  caps: AgentCapabilities = SOLANA_AGENT_CAPABILITIES
): boolean {
  return Boolean(caps[capability])
}

export function hasFlag(
  flag: keyof AgentFlags,
  flags: AgentFlags = SOLANA_AGENT_FLAGS
): boolean {
  return Boolean(flags[flag])
}
