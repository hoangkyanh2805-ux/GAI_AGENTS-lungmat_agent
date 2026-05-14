import { CommandRegistry } from '../types';

export const COMMANDS: CommandRegistry = {
  // ── SupportAgent ─────────────────────────────────────────────────────────
  HELP:           { command: '/help',           description: 'List all available commands',            agent: 'support' },
  REPORT_TODAY:   { command: '/report_today',   description: 'Daily content system report',            agent: 'support' },
  CHECK_ERRORS:   { command: '/check_errors',   description: 'Check system errors and incidents',      agent: 'support' },
  AUDIT_PIPELINE: { command: '/audit_pipeline', description: 'Run SOP pipeline audit checklist',       agent: 'support' },
  CHECK_PENDING:  { command: '/check_pending',  description: 'List pending tasks and approvals',       agent: 'support' },
  // ── SalesAgent ────────────────────────────────────────────────────────────
  CREATE_BRIEF:   { command: '/create_brief',   description: 'Generate 5W1H content brief template',  agent: 'sales'   },
  LEAD_CAPTURE:   { command: '/lead_capture',   description: 'Capture a new sales lead',              agent: 'sales'   },
  PRODUCT_INFO:   { command: '/product_info',   description: 'Get product and pricing information',    agent: 'sales'   },
  // ── MemoryAgent ───────────────────────────────────────────────────────────
  MEMORY_STORE:   { command: '/memory_store',   description: 'Store a key-value pair in agent memory', agent: 'memory'  },
  MEMORY_GET:     { command: '/memory_get',     description: 'Retrieve a value from agent memory',    agent: 'memory'  },
  MEMORY_LIST:    { command: '/memory_list',    description: 'List all memory keys',                  agent: 'memory'  },
};
