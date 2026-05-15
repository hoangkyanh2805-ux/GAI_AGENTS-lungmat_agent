import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { validateEnv, logEnvStatus, ENV } from './config/env';
import { FileLogger } from './memory/FileLogger';
import { MemoryManager } from './memory/MemoryManager';
import { ToolRegistry } from './tools/ToolRegistry';
import { LogTool } from './tools/LogTool';
import { SearchMemoryTool } from './tools/SearchMemoryTool';
import { RouterAgent } from './agents/RouterAgent';
import { SafetyAgent } from './agents/SafetyAgent';
import { SupportAgent } from './agents/SupportAgent';
import { SalesAgent } from './agents/SalesAgent';
import { MemoryAgent } from './agents/MemoryAgent';
import { ResearchAgent } from './agents/ResearchAgent';
import { MarketSummaryAgent } from './agents/MarketSummaryAgent';
import { ThreadWriterAgent } from './agents/ThreadWriterAgent';
import { TelegramPublisherAgent } from './agents/TelegramPublisherAgent';
import { DailyReportAgent } from './agents/DailyReportAgent';
import { RAGAgent } from './agents/RAGAgent';
import { OpsAgent } from './agents/OpsAgent';
import { SupervisorAgent } from './agents/SupervisorAgent';
import { buildSupportSkills, buildSalesSkills } from './skills/registry';
import { JobQueue } from './queue/JobQueue';
import { JobWorker } from './queue/JobWorker';
import { CronScheduler } from './scheduler/CronScheduler';
import { createContext } from './trace/ExecutionTrace';
import { AgentMessage, JobType } from './types';
import { randomUUID } from 'crypto';
import healthRouter from './routes/health';
import { createCommandRouter } from './routes/command';
import { createTraceRouter } from './routes/trace';
import { createIngestRouter } from './routes/ingest';
import { createRAGRouter } from './routes/rag';
import { createQueueRouter } from './routes/queue';
import { createApprovalRouter } from './routes/approval';
import { createScheduleRouter, setScheduler } from './routes/schedule';
import { TelegramReceiver } from './integrations/TelegramReceiver';
import { TelegramClient } from './integrations/TelegramClient';
import { ApprovalStore } from './approval/ApprovalStore';

validateEnv();
logEnvStatus();

// ── Shared infrastructure ─────────────────────────────────────────────────────
const memory = new MemoryManager();

const tools = new ToolRegistry()
  .register(new LogTool())
  .register(new SearchMemoryTool(memory));

// ── Core agents ───────────────────────────────────────────────────────────────
const router    = new RouterAgent();
const safety    = new SafetyAgent();
const support   = new SupportAgent(buildSupportSkills());
const sales     = new SalesAgent(buildSalesSkills());
const memAgent  = new MemoryAgent(memory);

// ── Phase 3 agents ────────────────────────────────────────────────────────────
const research        = new ResearchAgent();
const marketSummary   = new MarketSummaryAgent();
const threadWriter    = new ThreadWriterAgent();
const telegramPub     = new TelegramPublisherAgent();
const dailyReport     = new DailyReportAgent();
const ragAgent        = new RAGAgent();
const opsAgent        = new OpsAgent();

const supervisor = new SupervisorAgent(router, safety, [
  support, sales, memAgent,
  research, marketSummary, threadWriter, telegramPub, dailyReport,
  ragAgent, opsAgent,
]);

const telegramReceiver = new TelegramReceiver(supervisor);

// ── Approval-gate helper — sends draft to admin DM with approve/reject buttons ─
async function publishDraftToAdmin(opts: {
  draftText: string;
  agentName: string;
  user: string;
  traceId: string;
}): Promise<void> {
  if (!ENV.ADMIN_TELEGRAM_CHAT_ID) {
    FileLogger.info('[publishDraftToAdmin] ADMIN_TELEGRAM_CHAT_ID not set — skipping approval gate', {});
    return;
  }
  const approval = ApprovalStore.create({
    trace_id: opts.traceId,
    type: 'publish_telegram',
    content: opts.draftText,
    agent: opts.agentName,
    user: opts.user,
  });
  await TelegramClient.sendMessageWithButtons(
    ENV.ADMIN_TELEGRAM_CHAT_ID,
    `📝 *Draft from ${opts.agentName}*\n\n${opts.draftText}`,
    [[
      { text: '✅ Approve & Publish', callback_data: `approve:${approval.id}` },
      { text: '❌ Reject',           callback_data: `reject:${approval.id}` },
    ]],
  );
  FileLogger.info('[publishDraftToAdmin] draft sent to admin', { approvalId: approval.id, agent: opts.agentName });
}

// ── Job worker (background processor) ────────────────────────────────────────
const jobWorker = new JobWorker();

function makeMessage(type: string, payload: Record<string, unknown>): AgentMessage {
  return {
    id: randomUUID(),
    content: `/${type}`,
    command: `/${type}`,
    payload,
    user: 'scheduler',
    source: 'job_queue',
    timestamp: new Date().toISOString(),
  };
}

jobWorker
  .register('research', async (job) => {
    const ctx = createContext({ user: 'scheduler', source: 'job_queue', mock_llm: process.env.MOCK_LLM === '1' });
    const resp = await research.process(makeMessage('research', job.payload), ctx);
    if (resp.status === 'success' && resp.reply) {
      await publishDraftToAdmin({ draftText: resp.reply, agentName: resp.agent, user: 'scheduler', traceId: resp.trace_id });
    }
    return resp;
  })
  .register('market_summary', async (job) => {
    const ctx = createContext({ user: 'scheduler', source: 'job_queue', mock_llm: process.env.MOCK_LLM === '1' });
    const resp = await marketSummary.process(makeMessage('market_summary', job.payload), ctx);
    if (resp.status === 'success' && resp.reply) {
      await publishDraftToAdmin({ draftText: resp.reply, agentName: resp.agent, user: 'scheduler', traceId: resp.trace_id });
    }
    return resp;
  })
  .register('write_thread', async (job) => {
    const ctx = createContext({ user: 'scheduler', source: 'job_queue', mock_llm: process.env.MOCK_LLM === '1' });
    return threadWriter.process(makeMessage('write_thread', job.payload), ctx);
  })
  .register('daily_report', async (job) => {
    const ctx = createContext({ user: 'scheduler', source: 'job_queue', mock_llm: process.env.MOCK_LLM === '1' });
    return dailyReport.process(makeMessage('daily_report', job.payload), ctx);
  });

jobWorker.start();

// ── Scheduler (cron-based job trigger) ───────────────────────────────────────
const scheduler = new CronScheduler(async (schedule) => {
  FileLogger.info('[Scheduler] enqueuing job', { name: schedule.name, type: schedule.job_type });
  JobQueue.enqueue(schedule.job_type, schedule.payload);
});

setScheduler(scheduler);
scheduler.start();

if (process.env.NODE_ENV !== 'test') {
  const existing = scheduler.list();
  const defaultSchedules: Array<{ name: string; cron: string; job_type: JobType; payload: Record<string, unknown> }> = [
    { name: 'daily_market_summary_morning', cron: '0 0 * * *',  job_type: 'market_summary', payload: { tickers: ['XAUUSD'] } },
    { name: 'daily_research_morning',       cron: '0 0 * * *',  job_type: 'research',       payload: { topic: 'gold XAUUSD news Fed inflation DXY dollar', limit: 5 } },
    { name: 'daily_market_summary_evening', cron: '30 15 * * *', job_type: 'market_summary', payload: { tickers: ['XAUUSD'] } },
  ];
  for (const d of defaultSchedules) {
    if (!existing.some((s) => s.name === d.name)) {
      scheduler.add(d);
      FileLogger.info('[index] seeded schedule', { name: d.name, cron: d.cron });
    }
  }
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Security middleware — /health is the only public endpoint
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.path === '/health') return next();
  const secret = req.headers['x-agent-secret'];
  if (!secret || secret !== ENV.AGENT_SHARED_SECRET) {
    FileLogger.error('Unauthorized', { path: req.path, ip: req.ip });
    res.status(401).json({ status: 'error', message: 'Unauthorized: invalid x-agent-secret' });
    return;
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);

const commandRouter = createCommandRouter(supervisor);
app.use('/command', commandRouter);
app.use('/agent', commandRouter);         // backward compat

app.use('/trace',    createTraceRouter());
app.use('/ingest',   createIngestRouter());
app.use('/rag',      createRAGRouter());
app.use('/queue',    createQueueRouter());
app.use('/approval', createApprovalRouter());
app.use('/schedule', createScheduleRouter());

app.listen(ENV.PORT, () => {
  FileLogger.info('Lungmat Agent started', {
    port: ENV.PORT,
    env: ENV.NODE_ENV,
    agents: [
      'SupervisorAgent', 'RouterAgent', 'SafetyAgent',
      'SupportAgent', 'SalesAgent', 'MemoryAgent',
      'ResearchAgent', 'MarketSummaryAgent', 'ThreadWriterAgent',
      'TelegramPublisherAgent', 'DailyReportAgent', 'RAGAgent', 'OpsAgent',
    ],
    tools: tools.list(),
    mock_llm: process.env.MOCK_LLM === '1',
  });
});

// ── Telegram inbound receiver (long-polling) ─────────────────────────────────
telegramReceiver.start();

// Graceful shutdown
const shutdown = (signal: string): void => {
  FileLogger.info(`[index] ${signal} received — shutting down`);
  telegramReceiver.stop();
  scheduler.stop?.();          // safe if method missing
  process.exit(0);
};
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
