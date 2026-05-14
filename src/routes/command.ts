import { Router, Request, Response } from 'express';
import { FileLogger } from '../memory/FileLogger';

// Processor interface — decouples the route from the concrete SupervisorAgent class.
// Any object with a compatible process() method works here.
export interface Processor {
  process(
    command: string,
    payload: Record<string, unknown>,
    meta: { user: string; source: string; project?: string }
  ): Promise<{
    status: string;
    reply: string;
    next_actions: string[];
    agent: string;
    trace_id: string;
  }>;
}

interface CommandBody {
  command?: string;
  project?: string;
  user?: string;
  source?: string;
  chat_id?: string | number;
  payload?: Record<string, unknown>;
}

export function createCommandRouter(processor: Processor): Router {
  const router = Router();

  router.post('/command', async (req: Request, res: Response): Promise<void> => {
    const {
      command,
      project,
      user = 'unknown',
      source = 'unknown',
      payload = {},
    } = req.body as CommandBody;

    if (!command) {
      res.status(400).json({ status: 'error', message: 'command is required' });
      return;
    }

    FileLogger.info('Incoming request', { command, user, source, project });

    const { trace_id, ...rest } = await processor.process(command, payload ?? {}, {
      user,
      source,
      project,
    });

    res.json({ ...rest, trace_id });
  });

  return router;
}
