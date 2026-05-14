import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { JobQueue } from '../queue/JobQueue';
import { addStep } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';

const DEFAULT_TOPICS = ['AI startup funding', 'crypto market', 'tech stocks'];
const DEFAULT_TICKERS = ['BTC', 'ETH', 'SPY', 'AAPL'];

export class DailyReportAgent implements SubAgent {
  readonly name = 'DailyReportAgent';
  readonly role: AgentRole = 'daily_report';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const topics = (message.payload.topics as string[] | undefined) ?? DEFAULT_TOPICS;
    const tickers = (message.payload.tickers as string[] | undefined) ?? DEFAULT_TICKERS;
    const primaryTopic = topics[0];

    try {
      const jobs = [
        ...topics.map((topic) => JobQueue.enqueue('research', { topic })),
        JobQueue.enqueue('market_summary', { tickers }),
        JobQueue.enqueue('write_thread', { topic: primaryTopic }),
      ];

      addStep(ctx, {
        agent: this.name,
        action: 'enqueue_jobs',
        input: { topics, tickers },
        output: { job_count: jobs.length, job_ids: jobs.map((j) => j.id) },
        duration_ms: 0,
      });

      FileLogger.info('[DailyReportAgent] enqueued', { count: jobs.length });
      const jobList = jobs
        .map((j) => `• \`${j.type}\` → \`${j.id.slice(0, 8)}…\``)
        .join('\n');

      return {
        status: 'success',
        reply: `📊 *Daily Report Queued*\n\n${jobs.length} jobs scheduled:\n${jobList}\n\nMonitor: \`GET /queue\``,
        next_actions: ['/queue_status'],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { job_ids: jobs.map((j) => j.id), topics, tickers },
      };
    } catch (err) {
      FileLogger.error('[DailyReportAgent] failed', err);
      return { status: 'error', reply: 'Failed to queue daily report.', next_actions: [], agent: this.name, trace_id: ctx.trace_id };
    }
  }
}
