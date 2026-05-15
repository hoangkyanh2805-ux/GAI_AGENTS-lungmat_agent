/**
 * E2E local smoke test for Lungmat Agent (Hermes multi-agent).
 * Usage:
 *   npm run test:e2e-local
 *   $env:MOCK_LLM="1"; npm run test:e2e-local
 *
 * Starts an isolated server on port 3099, runs all assertions, tears it down.
 * Expected final output: "HTTP 200, PASSED"
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { spawn, spawnSync, ChildProcess } from 'child_process';
import http from 'http';

const TEST_PORT = 3099;
const SECRET = process.env.AGENT_SHARED_SECRET ?? 'dev_secret_lungmat_2026';
const MOCK_LLM = process.env.MOCK_LLM === '1';

// ── HTTP helpers ───────────────────────────────────────────────────────────────

type JsonBody = Record<string, unknown>;

function httpRequest(
  method: 'GET' | 'POST',
  urlPath: string,
  headers: Record<string, string> = {},
  body?: unknown
): Promise<{ status: number; body: JsonBody }> {
  return new Promise((resolve, reject) => {
    const raw = body ? JSON.stringify(body) : '';
    const opts: http.RequestOptions = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(raw ? { 'Content-Length': String(Buffer.byteLength(raw)) } : {}),
        ...headers,
      },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c: Buffer) => { data += c.toString(); });
      res.on('end', () => {
        try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) as JsonBody }); }
        catch { resolve({ status: res.statusCode ?? 0, body: { raw: data } }); }
      });
    });
    req.on('error', reject);
    if (raw) req.write(raw);
    req.end();
  });
}

async function waitReady(retries = 30, delayMs = 300): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try { await httpRequest('GET', '/health'); return; }
    catch { await new Promise((r) => setTimeout(r, delayMs)); }
  }
  throw new Error(`Server on :${TEST_PORT} never became ready`);
}

// ── Test case builder ─────────────────────────────────────────────────────────

interface Case {
  name: string;
  run(): Promise<{ passed: boolean; detail?: string }>;
}

const AUTH = { 'x-agent-secret': SECRET };

function cmd(
  label: string,
  command: string,
  opts: { auth?: boolean; expectStatus?: number; expectBody?: (b: JsonBody) => boolean } = {}
): Case {
  const { auth = true, expectStatus = 200, expectBody } = opts;
  return {
    name: label,
    async run() {
      const headers: Record<string, string> = auth ? AUTH : {};
      const r = await httpRequest(
        'POST', '/command/command', headers,
        { command, user: 'e2e', source: 'e2e', payload: {} }
      );
      const statusOk = r.status === expectStatus;
      const bodyOk = expectBody ? expectBody(r.body) : true;
      const passed = statusOk && bodyOk;
      return {
        passed,
        detail: passed ? undefined : `HTTP ${r.status} | ${JSON.stringify(r.body).slice(0, 120)}`,
      };
    },
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

let lastTraceId   = '';
let lastApprovalId = '';

const CASES: Case[] = [
  // ── Health ──────────────────────────────────────────────────────────────────
  {
    name: 'GET /health → 200 OK',
    async run() {
      const r = await httpRequest('GET', '/health');
      return { passed: r.status === 200 && r.body.status === 'OK' };
    },
  },
  // ── Auth guard ───────────────────────────────────────────────────────────────
  cmd('POST no secret → 401', '/help', { auth: false, expectStatus: 401 }),
  // ── SupportAgent ─────────────────────────────────────────────────────────────
  cmd('POST /help → 200 success [SupportAgent]',           '/help'),
  cmd('POST /report_today → 200 success [SupportAgent]',   '/report_today'),
  cmd('POST /check_errors → 200 success [SupportAgent]',   '/check_errors'),
  cmd('POST /audit_pipeline → 200 success [SupportAgent]', '/audit_pipeline'),
  cmd('POST /check_pending → 200 success [SupportAgent]',  '/check_pending'),
  // ── SalesAgent ───────────────────────────────────────────────────────────────
  cmd('POST /create_brief → 200 success [SalesAgent]',     '/create_brief'),
  cmd('POST /lead_capture → 200 success [SalesAgent]',     '/lead_capture'),
  cmd('POST /product_info → 200 success [SalesAgent]',     '/product_info'),
  // ── MemoryAgent ──────────────────────────────────────────────────────────────
  {
    name: 'POST /memory_store → 200 success [MemoryAgent]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/memory_store', user: 'e2e', source: 'e2e',
        payload: { key: 'e2e_test_key', value: { hello: 'hermes' } },
      });
      const passed = r.status === 200 && r.body.status === 'success';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body) };
    },
  },
  {
    name: 'POST /memory_get → 200 hit [MemoryAgent]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/memory_get', user: 'e2e', source: 'e2e',
        payload: { key: 'e2e_test_key' },
      });
      const hit = r.status === 200 && String(r.body.reply ?? '').includes('Memory hit');
      return { passed: hit, detail: hit ? undefined : JSON.stringify(r.body) };
    },
  },
  cmd('POST /memory_list → 200 success [MemoryAgent]', '/memory_list'),
  // ── Graceful fallback ─────────────────────────────────────────────────────────
  cmd('POST /unknown_cmd → 200 graceful', '/unknown_cmd'),
  // ── Backward compat ──────────────────────────────────────────────────────────
  {
    name: 'POST /agent/command → 200 backward compat',
    async run() {
      const r = await httpRequest('POST', '/agent/command', AUTH, {
        command: '/help', user: 'e2e', source: 'e2e', payload: {},
      });
      return { passed: r.status === 200 && r.body.status === 'success' };
    },
  },
  // ── Trace ────────────────────────────────────────────────────────────────────
  {
    name: 'Response includes trace_id',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/help', user: 'e2e', source: 'e2e', payload: {},
      });
      const id = typeof r.body.trace_id === 'string' && r.body.trace_id.length > 0;
      if (id) lastTraceId = r.body.trace_id as string;
      return { passed: id, detail: id ? undefined : 'trace_id missing from response' };
    },
  },
  {
    name: 'GET /trace/:id → 200 with steps array',
    async run() {
      if (!lastTraceId) return { passed: false, detail: 'no trace_id captured' };
      const r = await httpRequest('GET', `/trace/${lastTraceId}`, AUTH);
      const ok =
        r.status === 200 &&
        r.body.status === 'success' &&
        Array.isArray((r.body.trace as JsonBody)?.steps);
      return { passed: ok, detail: ok ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
  {
    name: 'GET /trace/nonexistent → 404',
    async run() {
      const r = await httpRequest('GET', '/trace/00000000-0000-0000-0000-000000000000', AUTH);
      return { passed: r.status === 404 };
    },
  },

  // ── Phase 3: ResearchAgent ────────────────────────────────────────────────────
  cmd('POST /research → 200 success [ResearchAgent]', '/research',
    { expectBody: (b) => b.status === 'success' && String(b.reply ?? '').includes('Research') }),
  // Verify mock articles carry [Mock] prefix in mock mode (ApifyClient fallback path)
  {
    name: 'POST /research mock mode → reply contains [Mock] articles [ApifyClient mock]',
    async run() {
      if (!MOCK_LLM) return { passed: true, detail: 'skipped — not in MOCK_LLM mode' };
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/research', user: 'e2e', source: 'e2e',
        payload: { topic: 'mock verification test' },
      });
      const reply = String(r.body.reply ?? '');
      const passed = r.status === 200 && r.body.status === 'success' && reply.includes('[Mock]');
      return { passed, detail: passed ? undefined : `reply (no [Mock]): ${reply.slice(0, 150)}` };
    },
  },
  // Verify ResearchAgent always returns doc_id regardless of mock/real mode
  {
    name: 'POST /research → meta.doc_id present [ApifyClient any mode]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/research', user: 'e2e', source: 'e2e',
        payload: { topic: 'doc_id presence check' },
      });
      const meta = r.body.meta as JsonBody | undefined;
      const docId = typeof meta?.doc_id === 'string' && meta.doc_id.length > 0;
      const passed = r.status === 200 && r.body.status === 'success' && docId;
      return { passed, detail: passed ? undefined : `meta: ${JSON.stringify(meta)}` };
    },
  },

  // ── Phase 3: MarketSummaryAgent ───────────────────────────────────────────────
  cmd('POST /market_summary → 200 success [MarketSummaryAgent]', '/market_summary',
    { expectBody: (b) => b.status === 'success' }),

  // ── Phase 3: RAGAgent — ingest ────────────────────────────────────────────────
  {
    name: 'POST /rag_ingest → 200 success [RAGAgent]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/rag_ingest', user: 'e2e', source: 'e2e',
        payload: { title: 'E2E Test Doc', content: 'This document contains test content about AI trends and markets.', source: 'e2e', tags: ['test', 'ai'] },
      });
      const passed = r.status === 200 && r.body.status === 'success';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: RAGAgent — search ────────────────────────────────────────────────
  {
    name: 'POST /rag_search → 200 results [RAGAgent]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/rag_search', user: 'e2e', source: 'e2e',
        payload: { query: 'AI trends', limit: 5 },
      });
      const passed = r.status === 200 && r.body.status === 'success';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: REST — GET /rag/search ──────────────────────────────────────────
  {
    name: 'GET /rag/search?q=AI → 200 results',
    async run() {
      const r = await httpRequest('GET', '/rag/search?q=AI', AUTH);
      const passed = r.status === 200 && r.body.status === 'success';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: REST — POST /ingest ─────────────────────────────────────────────
  {
    name: 'POST /ingest → 200 doc ingested',
    async run() {
      const r = await httpRequest('POST', '/ingest', AUTH, {
        title: 'REST Ingest Test', content: 'Content ingested via REST endpoint for testing.', source: 'rest_test', tags: ['test'],
      });
      const passed = r.status === 200 && r.body.status === 'success' && typeof (r.body.doc as JsonBody)?.id === 'string';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: ThreadWriterAgent + approval flow ────────────────────────────────
  {
    name: 'POST /write_thread → 200, returns approval_id [ThreadWriterAgent]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/write_thread', user: 'e2e', source: 'e2e',
        payload: { topic: 'AI startup trends' },
      });
      const meta = r.body.meta as JsonBody | undefined;
      const id = meta?.approval_id as string | undefined;
      if (id) lastApprovalId = id;
      const passed = r.status === 200 && r.body.status === 'success' && !!id;
      return { passed, detail: passed ? undefined : `no approval_id in: ${JSON.stringify(r.body).slice(0, 200)}` };
    },
  },
  {
    name: 'GET /approval → 200 list [REST]',
    async run() {
      const r = await httpRequest('GET', '/approval?status=pending', AUTH);
      const passed = r.status === 200 && r.body.status === 'success';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
  {
    name: 'POST /approval/:id/approve → 200 approved [REST]',
    async run() {
      if (!lastApprovalId) return { passed: false, detail: 'no approval_id from prior test' };
      const r = await httpRequest('POST', `/approval/${lastApprovalId}/approve`, AUTH, { reviewed_by: 'e2e_tester' });
      const passed = r.status === 200 && r.body.status === 'success' && (r.body.approval as JsonBody)?.status === 'approved';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
  {
    name: 'POST /publish_telegram → 200 published [TelegramPublisherAgent]',
    async run() {
      if (!lastApprovalId) return { passed: false, detail: 'no approval_id from prior test' };
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/publish_telegram', user: 'e2e', source: 'e2e',
        payload: { approval_id: lastApprovalId, chat_id: 'mock_chat' },
      });
      const passed = r.status === 200 && r.body.status === 'success';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: DailyReportAgent (queues jobs) ───────────────────────────────────
  {
    name: 'POST /daily_report → 200 jobs queued [DailyReportAgent]',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/daily_report', user: 'e2e', source: 'e2e', payload: {},
      });
      const meta = r.body.meta as JsonBody | undefined;
      const passed = r.status === 200 && r.body.status === 'success' && Array.isArray(meta?.job_ids);
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: REST — GET /queue ────────────────────────────────────────────────
  {
    name: 'GET /queue → 200 queue status [REST]',
    async run() {
      const r = await httpRequest('GET', '/queue', AUTH);
      const passed = r.status === 200 && r.body.status === 'success' && typeof (r.body.summary as JsonBody)?.pending === 'number';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },

  // ── Phase 3: OpsAgent ────────────────────────────────────────────────────────
  cmd('POST /queue_status → 200 success [OpsAgent]', '/queue_status',
    { expectBody: (b) => b.status === 'success' }),

  // ── Approval ID UX fixes ──────────────────────────────────────────────────────
  {
    name: '/approval_list reply contains full UUID (not truncated)',
    async run() {
      const r = await httpRequest('POST', '/command/command', AUTH, {
        command: '/approval_list', user: 'e2e', source: 'e2e', payload: {},
      });
      const meta = r.body.meta as JsonBody | undefined;
      const approvals = meta?.approvals as Array<{ id: string }> | undefined;
      // Full UUID is 36 chars: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const fullId = Array.isArray(approvals) && approvals.length > 0 && approvals[0].id.length === 36;
      const passed = r.status === 200 && r.body.status === 'success' && fullId;
      return { passed, detail: passed ? undefined : `meta.approvals[0].id=${approvals?.[0]?.id ?? 'missing'}` };
    },
  },
  {
    name: 'POST /approval/:fullId/approve → 200 by full UUID',
    async run() {
      // Write a fresh thread and approve by full UUID
      const wr = await httpRequest('POST', '/command/command', AUTH, {
        command: '/write_thread', user: 'e2e', source: 'e2e', payload: { topic: 'Full ID test' },
      });
      const aid = (wr.body.meta as JsonBody | undefined)?.approval_id as string | undefined;
      if (!aid) return { passed: false, detail: 'no approval_id from /write_thread' };
      const r = await httpRequest('POST', `/approval/${aid}/approve`, AUTH, {});
      const passed = r.status === 200 && (r.body.approval as JsonBody)?.status === 'approved';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
  {
    name: 'POST /approval/:prefix/approve → 200 by short unique prefix',
    async run() {
      // Write another thread; approve using only the first 8 chars of its ID
      const wr = await httpRequest('POST', '/command/command', AUTH, {
        command: '/write_thread', user: 'e2e', source: 'e2e', payload: { topic: 'Prefix ID test' },
      });
      const aid = (wr.body.meta as JsonBody | undefined)?.approval_id as string | undefined;
      if (!aid) return { passed: false, detail: 'no approval_id from /write_thread' };
      const prefix = aid.slice(0, 8);
      const r = await httpRequest('POST', `/approval/${prefix}/approve`, AUTH, {});
      const passed =
        r.status === 200 &&
        (r.body.approval as JsonBody)?.status === 'approved' &&
        (r.body.approval as JsonBody)?.id === aid; // confirm resolved to the right record
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
  cmd('POST /approval_list → 200 success [OpsAgent]', '/approval_list',
    { expectBody: (b) => b.status === 'success' }),

  // ── Phase 3: REST — POST /schedule ───────────────────────────────────────────
  {
    name: 'POST /schedule → 200 schedule created [REST]',
    async run() {
      const r = await httpRequest('POST', '/schedule', AUTH, {
        name: 'E2E Test Schedule',
        cron: '0 8 * * *',
        job_type: 'daily_report',
        payload: {},
      });
      const passed = r.status === 200 && r.body.status === 'success' && typeof (r.body.schedule as JsonBody)?.id === 'string';
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
  {
    name: 'GET /schedule → 200 schedules list [REST]',
    async run() {
      const r = await httpRequest('GET', '/schedule', AUTH);
      const passed = r.status === 200 && r.body.status === 'success' && Array.isArray(r.body.schedules);
      return { passed, detail: passed ? undefined : JSON.stringify(r.body).slice(0, 200) };
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nLungmat Agent — E2E Local Test (Hermes multi-agent)${MOCK_LLM ? ' [MOCK_LLM=1]' : ''}`);
  console.log('─'.repeat(60));

  const env = {
    ...process.env,
    PORT: String(TEST_PORT),
    NODE_ENV: 'test',
    ...(MOCK_LLM ? { MOCK_LLM: '1' } : {}),
  };

  const server: ChildProcess = spawn(
    'npx', ['ts-node', path.join(__dirname, '../src/index.ts')],
    { env, stdio: 'pipe', shell: true, cwd: path.join(__dirname, '..') }
  );

  server.stderr?.on('data', (d: Buffer) => {
    const msg = d.toString();
    if (msg.includes('[ERROR]') || msg.includes('Error') || msg.includes('EADDR')) {
      process.stderr.write(`  server: ${msg}`);
    }
  });

  let exitCode = 0;

  try {
    await waitReady();
    console.log(`  server ready on :${TEST_PORT}\n`);

    let passed = 0;
    for (const c of CASES) {
      const { passed: ok, detail } = await c.run();
      const icon = ok ? '[ok]  ' : '[FAIL]';
      console.log(`  ${icon} ${c.name}${detail ? `\n         ↳ ${detail}` : ''}`);
      if (ok) passed++;
    }

    const total = CASES.length;
    console.log(`\n  ${passed}/${total} assertions passed`);

    if (passed === total) {
      console.log('\nHTTP 200, PASSED\n');
    } else {
      console.log('\nFAILED\n');
      exitCode = 1;
    }
  } catch (err) {
    console.error('\n[ERROR] E2E aborted:', err);
    exitCode = 1;
  } finally {
    // On Windows, SIGTERM only kills the shell wrapper — use taskkill /T to kill the full process tree.
    if (process.platform === 'win32' && server.pid) {
      spawnSync('taskkill', ['/F', '/T', '/PID', String(server.pid)], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }

  process.exit(exitCode);
}

main();
