import { AgentMessage, AgentRole, ExecutionContext, RoutingDecision } from '../types';

// Static routing table: exact command → target agent role
const COMMAND_ROUTES: Record<string, AgentRole> = {
  '/help':           'support',
  '/report_today':   'support',
  '/check_errors':   'support',
  '/audit_pipeline': 'support',
  '/check_pending':  'support',
  '/create_brief':   'sales',
  '/lead_capture':   'sales',
  '/product_info':   'sales',
  '/memory_store':   'memory',
  '/memory_get':     'memory',
  '/memory_list':    'memory',
};

export class RouterAgent {
  readonly name = 'RouterAgent';
  readonly role: AgentRole = 'router';

  route(message: AgentMessage, ctx: ExecutionContext): RoutingDecision {
    // In mock mode the routing is identical; this hook is ready for future
    // LLM-based intent classification when mock_llm=false and LLM is configured.
    if (ctx.mock_llm) return this.staticRoute(message);
    return this.staticRoute(message);
  }

  private staticRoute(message: AgentMessage): RoutingDecision {
    const cmd =
      message.command ??
      message.content.trim().split(/\s+/)[0];
    const target: AgentRole = COMMAND_ROUTES[cmd] ?? 'support';
    return {
      target_agent: target,
      intent: cmd.replace(/^\//, ''),
      confidence: 1.0,
      fallback_agent: 'support',
    };
  }
}
