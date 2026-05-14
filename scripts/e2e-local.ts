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

let lastTraceId = '';

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
  // ── Trace response includes trace_id ─────────────────────────────────────────
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
  // ── Trace store (GET /trace/:id) ─────────────────────────────────────────────
  {
    name: 'GET /trace/:id → 200 with steps array',
    async run() {
      if (!lastTraceId) return { passed: false, detail: 'no trace_id captured from prior test' };
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
