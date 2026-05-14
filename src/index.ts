import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { validateEnv, ENV } from './config/env';
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
import { SupervisorAgent } from './agents/SupervisorAgent';
import { buildSupportSkills, buildSalesSkills } from './skills/registry';
import healthRouter from './routes/health';
import { createCommandRouter } from './routes/command';
import { createTraceRouter } from './routes/trace';

validateEnv();

// ── Shared infrastructure ─────────────────────────────────────────────────────
const memory = new MemoryManager();

const tools = new ToolRegistry()
  .register(new LogTool())
  .register(new SearchMemoryTool(memory));

// ── Agents ────────────────────────────────────────────────────────────────────
const router    = new RouterAgent();
const safety    = new SafetyAgent();
const support   = new SupportAgent(buildSupportSkills());
const sales     = new SalesAgent(buildSalesSkills());
const memAgent  = new MemoryAgent(memory);

const supervisor = new SupervisorAgent(router, safety, [support, sales, memAgent]);

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

app.use('/trace', createTraceRouter());   // GET /trace/:id, GET /trace/

app.listen(ENV.PORT, () => {
  FileLogger.info('Lungmat Agent (Hermes multi-agent) started', {
    port: ENV.PORT,
    env: ENV.NODE_ENV,
    agents: ['SupervisorAgent', 'RouterAgent', 'SafetyAgent', 'SupportAgent', 'SalesAgent', 'MemoryAgent'],
    tools: tools.list(),
  });
});
