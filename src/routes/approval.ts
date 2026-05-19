import { Router, Request, Response } from 'express';
import { ApprovalStore, AmbiguousPrefixError } from '../approval/ApprovalStore';
import { publishApprovedContent, PublishError } from '../publish/telegramPublish';

function handleStoreError(err: unknown, res: Response): void {
  if (err instanceof AmbiguousPrefixError) {
    res.status(400).json({ status: 'error', message: err.message });
  } else {
    res.status(500).json({ status: 'error', message: 'Internal error' });
  }
}

export function createApprovalRouter(): Router {
  const router = Router();

  // GET /approval?status=<pending|approved|rejected>
  router.get('/', (req: Request, res: Response): void => {
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const approvals = ApprovalStore.list(status);
    res.json({ status: 'success', count: approvals.length, approvals });
  });

  // GET /approval/:id  — accepts full UUID or unique prefix
  router.get('/:id', (req: Request, res: Response): void => {
    try {
      const approval = ApprovalStore.get(req.params.id);
      if (!approval) { res.status(404).json({ status: 'error', message: 'Approval not found' }); return; }
      res.json({ status: 'success', approval });
    } catch (err) {
      handleStoreError(err, res);
    }
  });

  // POST /approval/:id/approve  — accepts full UUID or unique prefix
  // Body optional: { reviewed_by, publish: true } — publish uses same path as /publish_telegram
  router.post('/:id/approve', async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as { reviewed_by?: string; publish?: boolean };
      const reviewedBy = body.reviewed_by ?? 'human';
      const approval = ApprovalStore.approve(req.params.id, reviewedBy);
      if (!approval) {
        res.status(404).json({ status: 'error', message: 'Approval not found or already reviewed' });
        return;
      }
      if (body.publish === true) {
        const plat = approval.platform ?? 'telegram';
        if (plat !== 'telegram') {
          res.status(400).json({
            status: 'error',
            message: `Approval is for \`${plat}\` — set publish:false and copy to Typefully.`,
            approval,
          });
          return;
        }
        try {
          const published = await publishApprovedContent(approval);
          res.json({ status: 'success', approval, published });
          return;
        } catch (err) {
          if (err instanceof PublishError) {
            res.status(400).json({ status: 'error', message: err.userMessage, approval });
            return;
          }
          throw err;
        }
      }
      res.json({ status: 'success', approval });
    } catch (err) {
      handleStoreError(err, res);
    }
  });

  // POST /approval/:id/reject  — accepts full UUID or unique prefix
  router.post('/:id/reject', (req: Request, res: Response): void => {
    try {
      const reviewedBy = (req.body as { reviewed_by?: string }).reviewed_by ?? 'human';
      const approval = ApprovalStore.reject(req.params.id, reviewedBy);
      if (!approval) {
        res.status(404).json({ status: 'error', message: 'Approval not found or already reviewed' });
        return;
      }
      res.json({ status: 'success', approval });
    } catch (err) {
      handleStoreError(err, res);
    }
  });

  return router;
}
