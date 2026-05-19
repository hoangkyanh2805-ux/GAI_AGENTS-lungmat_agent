import { CommandRegistry } from '../types';

export const COMMANDS: CommandRegistry = {
  // ── SupportAgent ─────────────────────────────────────────────────────────
  START:             { command: '/start',             description: 'Khởi động bot — chào hỏi Linh Cẩu style', agent: 'support'            },
  HELP:              { command: '/help',              description: 'List all available commands',              agent: 'support'            },
  REPORT_TODAY:      { command: '/report_today',      description: 'Daily content system report',              agent: 'support'            },
  CHECK_ERRORS:      { command: '/check_errors',      description: 'Check system errors and incidents',        agent: 'support'            },
  AUDIT_PIPELINE:    { command: '/audit_pipeline',    description: 'Run SOP pipeline audit checklist',         agent: 'support'            },
  CHECK_PENDING:     { command: '/check_pending',     description: 'List pending tasks and approvals',         agent: 'support'            },
  // ── SalesAgent ────────────────────────────────────────────────────────────
  CREATE_BRIEF:      { command: '/create_brief',      description: 'Generate 5W1H content brief template',     agent: 'sales'              },
  LEAD_CAPTURE:      { command: '/lead_capture',      description: 'Capture a new sales lead',                 agent: 'sales'              },
  PRODUCT_INFO:      { command: '/product_info',      description: 'Get product and pricing information',      agent: 'sales'              },
  // ── MemoryAgent ───────────────────────────────────────────────────────────
  MEMORY_STORE:      { command: '/memory_store',      description: 'Store a key-value pair in agent memory',   agent: 'memory'             },
  MEMORY_GET:        { command: '/memory_get',        description: 'Retrieve a value from agent memory',       agent: 'memory'             },
  MEMORY_LIST:       { command: '/memory_list',       description: 'List all memory keys',                     agent: 'memory'             },
  // ── ResearchAgent ─────────────────────────────────────────────────────────
  RESEARCH:          { command: '/research',          description: 'Scrape and ingest news for a topic',       agent: 'research'           },
  // ── MarketSummaryAgent ────────────────────────────────────────────────────
  MARKET_SUMMARY:    { command: '/market_summary',    description: 'Fetch market data and generate AI summary', agent: 'market_summary'     },
  // ── ThreadWriterAgent ─────────────────────────────────────────────────────
  WRITE_THREAD:      { command: '/write_thread',      description: 'Generate a Twitter thread draft (→ approval)', agent: 'thread_writer'  },
  CONTENT:           { command: '/content',           description: 'Multi-brand pack: TG + X + Threads + YouTube Shorts script', agent: 'content' },
  // ── TelegramPublisherAgent ────────────────────────────────────────────────
  PUBLISH_TELEGRAM:  { command: '/publish_telegram',  description: 'Publish approved content to Telegram',     agent: 'telegram_publisher' },
  // ── DailyReportAgent ─────────────────────────────────────────────────────
  DAILY_REPORT:      { command: '/daily_report',      description: 'Queue research + summary + thread for daily digest', agent: 'daily_report' },
  // ── RAGAgent ─────────────────────────────────────────────────────────────
  RAG_SEARCH:        { command: '/rag_search',        description: 'Search the RAG document store',            agent: 'rag'                },
  RAG_INGEST:        { command: '/rag_ingest',        description: 'Manually ingest a document into RAG',      agent: 'rag'                },
  // ── OpsAgent ─────────────────────────────────────────────────────────────
  QUEUE_STATUS:      { command: '/queue_status',      description: 'View job queue status',                    agent: 'ops'                },
  APPROVAL_LIST:     { command: '/approval_list',     description: 'List pending content approvals',           agent: 'ops'                },
  DEBUG_ENV:         { command: '/debug_env',         description: 'Show env booleans (no secrets exposed)',   agent: 'ops'                },
  APPROVE_PUBLISH:   { command: '/approve_publish',   description: '(internal) Approve and publish a draft',  agent: 'ops'                },
  REJECT_PUBLISH:    { command: '/reject_publish',    description: '(internal) Reject a pending draft',       agent: 'ops'                },
  // ── CoachAgent (admin DM only) ───────────────────────────────────────────
  COACH:             { command: '/coach',             description: 'Lửng Mật coach — Media OS ops (admin DM)', agent: 'coach'              },
};
