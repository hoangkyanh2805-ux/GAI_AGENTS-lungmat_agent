import {
  AgentMessage,
  AgentRole,
  ExecutionContext,
  RoutingDecision,
  SafetyDecision,
} from '../types';
import { FileLogger } from '../memory/FileLogger';

// Commands that modify shared state — log and allow, but flag for review
const MEDIUM_RISK = new Set([
  '/memory_store',
  '/publish_telegram', // actual external publish — auditable
]);

// Commands that are destructive — always blocked, require explicit human approval
const HIGH_RISK = new Set<string>([
  // reserved: '/delete_all', '/deploy', etc.
]);

export class SafetyAgent {
  readonly name = 'SafetyAgent';
  readonly role: AgentRole = 'safety';

  evaluate(
    message: AgentMessage,
    routing: RoutingDecision,
    ctx: ExecutionContext
  ): SafetyDecision {
    const cmd =
      message.command ?? message.content.trim().split(/\s+/)[0];

    if (HIGH_RISK.has(cmd)) {
      FileLogger.error('[SafetyAgent] HIGH RISK blocked', {
        cmd,
        user: ctx.user,
        trace_id: ctx.trace_id,
      });
      return {
        approved: false,
        risk_level: 'high',
        reason: `Command '${cmd}' is blocked — explicit human approval required.`,
        requires_human_approval: true,
      };
    }

    if (MEDIUM_RISK.has(cmd)) {
      FileLogger.info('[SafetyAgent] MEDIUM RISK flagged', {
        cmd,
        user: ctx.user,
        routing: routing.intent,
      });
      return {
        approved: true,
        risk_level: 'medium',
        reason: `Command '${cmd}' modifies state — logged for audit.`,
        requires_human_approval: false,
      };
    }

    return {
      approved: true,
      risk_level: 'low',
      reason: 'Read-only command — pre-approved.',
      requires_human_approval: false,
    };
  }
}
