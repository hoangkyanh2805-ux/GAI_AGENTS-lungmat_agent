import { AgentMessage, AgentRole, ExecutionContext, RoutingDecision } from '../types';

// Static routing table: exact command → target agent role
const COMMAND_ROUTES: Record<string, AgentRole> = {
  // ── SupportAgent ─────────────────────────────────────────────────────────
  '/help':              'support',
  '/report_today':      'support',
  '/check_errors':      'support',
  '/audit_pipeline':    'support',
  '/check_pending':     'support',
  // ── SalesAgent ────────────────────────────────────────────────────────────
  '/create_brief':      'sales',
  '/lead_capture':      'sales',
  '/product_info':      'sales',
  // ── MemoryAgent ───────────────────────────────────────────────────────────
  '/memory_store':      'memory',
  '/memory_get':        'memory',
  '/memory_list':       'memory',
  // ── ResearchAgent ─────────────────────────────────────────────────────────
  '/research':          'research',
  // ── MarketSummaryAgent ────────────────────────────────────────────────────
  '/market_summary':    'market_summary',
  // ── ThreadWriterAgent ─────────────────────────────────────────────────────
  '/write_thread':      'thread_writer',
  // ── TelegramPublisherAgent ────────────────────────────────────────────────
  '/publish_telegram':  'telegram_publisher',
  // ── DailyReportAgent ─────────────────────────────────────────────────────
  '/daily_report':      'daily_report',
  // ── RAGAgent ─────────────────────────────────────────────────────────────
  '/rag_search':        'rag',
  '/rag_ingest':        'rag',
  // ── OpsAgent ─────────────────────────────────────────────────────────────
  '/queue_status':      'ops',
  '/approval_list':     'ops',
  '/debug_env':         'ops',
  '/approve_publish':   'ops',
  '/reject_publish':    'ops',
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
