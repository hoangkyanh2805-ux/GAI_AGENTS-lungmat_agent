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
import { ContentAgent } from './agents/ContentAgent';
import { TelegramPublisherAgent } from './agents/TelegramPublisherAgent';
import { DailyReportAgent } from './agents/DailyReportAgent';
import { RAGAgent } from './agents/RAGAgent';
import { OpsAgent } from './agents/OpsAgent';
import { CoachAgent } from './agents/CoachAgent';
import { SupervisorAgent } from './agents/SupervisorAgent';
import { buildSupportSkills, buildSalesSkills } from './skills/registry';
import { JobQueue } from './queue/JobQueue';
import { JobWorker } from './queue/JobWorker';
import { CronScheduler } from './scheduler/CronScheduler';
import { createContext } from './trace/ExecutionTrace';
import { AgentMessage, JobType } from './types';
import { BrandId, resolveBrandChatId } from './config/brands';
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
import { createTelegramWebhookRouter } from './routes/telegramWebhook';

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
const contentAgent    = new ContentAgent();
const telegramPub     = new TelegramPublisherAgent();
const dailyReport     = new DailyReportAgent();
const ragAgent        = new RAGAgent();
const opsAgent        = new OpsAgent();
const coachAgent      = new CoachAgent();

const supervisor = new SupervisorAgent(router, safety, [
  support, sales, memAgent,
  research, marketSummary, threadWriter, contentAgent, telegramPub, dailyReport,
  ragAgent, opsAgent, coachAgent,
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
  })
  // Phase 7D-1: cron-driven /content per brand. ContentAgent handles approval DM
  // internally (createContentPackApprovals + sendContentApprovalDm), so we just
  // synthesize the canonical AgentMessage and delegate. Skip publish if the
  // brand channel (TELEGRAM_CHAT_ID_<BRAND>) is not yet configured.
  .register('content', async (job) => {
    const brand = job.payload.brand as BrandId | undefined;
    const topic = (job.payload.topic as string | undefined) ?? '';
    if (!brand) {
      console.warn('[7D-1] content job missing brand — skipping', { job_id: job.id });
      return { status: 'skipped', reason: 'brand_missing' };
    }
    const chatId = resolveBrandChatId(brand);
    if (!chatId) {
      console.warn(`[7D-1] daily_content_${brand} — skip publish: TELEGRAM_CHAT_ID_${brand.toUpperCase()} empty`);
      return { status: 'skipped', reason: 'chat_id_empty', brand };
    }
    const ctx = createContext({ user: 'scheduler', source: 'job_queue', mock_llm: process.env.MOCK_LLM === '1' });
    const message: AgentMessage = {
      id: randomUUID(),
      content: `/content ${brand} ${topic}`,
      command: '/content',
      payload: { brand, topic, chat_id: chatId },
      user: 'scheduler',
      source: 'job_queue',
      timestamp: new Date().toISOString(),
    };
    return contentAgent.process(message, ctx);
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
    // Phase 7D-1: daily /content per brand, pre-session VN (Asia/Ho_Chi_Minh = UTC+7)
    // Cron evaluates in UTC: 01:00 UTC = 08:00 VN, 06:00 UTC = 13:00 VN, 12:00 UTC = 19:00 VN
    { name: 'daily_content_alpha',   cron: '0 1 * * *',  job_type: 'content', payload: { brand: 'alpha',   topic: 'XAUUSD daily brief' } },
    { name: 'daily_content_raymond', cron: '0 6 * * *',  job_type: 'content', payload: { brand: 'raymond', topic: 'XAUUSD daily brief' } },
    { name: 'daily_content_vip10x',  cron: '0 12 * * *', job_type: 'content', payload: { brand: 'vip10x',  topic: 'XAUUSD daily brief' } },
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

// Security middleware — /health and /telegram/webhook are the public endpoints.
// /telegram/webhook has its own auth (X-Telegram-Bot-Api-Secret-Token, Phase 7D-5).
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.path === '/health') return next();
  if (req.path === '/telegram/webhook') return next();
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

// Phase 7D-5: Telegram webhook route — mounted on app (not behind a prefix)
// because Telegram POSTs to a fixed URL. Auth is via X-Telegram-Bot-Api-Secret-Token.
app.use(createTelegramWebhookRouter(telegramReceiver));

app.listen(ENV.PORT, () => {
  FileLogger.info('Lungmat Agent started', {
    port: ENV.PORT,
    env: ENV.NODE_ENV,
    agents: [
      'SupervisorAgent', 'RouterAgent', 'SafetyAgent',
      'SupportAgent', 'SalesAgent', 'MemoryAgent',
      'ResearchAgent', 'MarketSummaryAgent', 'ThreadWriterAgent', 'ContentAgent',
      'TelegramPublisherAgent', 'DailyReportAgent', 'RAGAgent', 'OpsAgent',
    ],
    tools: tools.list(),
    mock_llm: process.env.MOCK_LLM === '1',
    telegram_mode: ENV.TELEGRAM_MODE,
  });

  // Phase 7D-5: register/clear webhook based on TELEGRAM_MODE.
  // Webhook mode → POST setWebhook so Telegram routes updates to our HTTPS endpoint.
  // Long-poll mode → POST deleteWebhook so Telegram doesn't keep a stale URL (no-op if none).
  if (ENV.TELEGRAM_MODE === 'webhook') {
    if (!ENV.TELEGRAM_WEBHOOK_URL || !ENV.TELEGRAM_WEBHOOK_SECRET) {
      FileLogger.error('[7D-5] TELEGRAM_MODE=webhook but TELEGRAM_WEBHOOK_URL/SECRET missing — webhook NOT registered', {});
    } else {
      TelegramClient.setWebhook(ENV.TELEGRAM_WEBHOOK_URL, ENV.TELEGRAM_WEBHOOK_SECRET)
        .then(() => FileLogger.info('[7D-5] webhook registered', { url: ENV.TELEGRAM_WEBHOOK_URL }))
        .catch((err) => FileLogger.error('[7D-5] setWebhook failed at startup', err));
    }
  } else {
    // Best-effort cleanup — if previously running in webhook mode, drop registration.
    TelegramClient.deleteWebhook().catch((err) =>
      FileLogger.error('[7D-5] deleteWebhook (longpoll cleanup) failed', err),
    );
  }
});

// ── Telegram inbound receiver (long-polling — skipped if TELEGRAM_MODE=webhook) ──
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
