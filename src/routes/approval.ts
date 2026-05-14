import { Router, Request, Response } from 'express';
import { ApprovalStore } from '../approval/ApprovalStore';

export function createApprovalRouter(): Router {
  const router = Router();

  // GET /approval?status=<pending|approved|rejected>
  router.get('/', (req: Request, res: Response): void => {
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const approvals = ApprovalStore.list(status);
    res.json({ status: 'success', count: approvals.length, approvals });
  });

  // GET /approval/:id
  router.get('/:id', (req: Request, res: Response): void => {
    const approval = ApprovalStore.get(req.params.id);
    if (!approval) { res.status(404).json({ status: 'error', message: 'Approval not found' }); return; }
    res.json({ status: 'success', approval });
  });

  // POST /approval/:id/approve
  router.post('/:id/approve', (req: Request, res: Response): void => {
    const reviewedBy = (req.body as { reviewed_by?: string }).reviewed_by ?? 'human';
    const approval = ApprovalStore.approve(req.params.id, reviewedBy);
    if (!approval) {
      res.status(404).json({ status: 'error', message: 'Approval not found or already reviewed' });
      return;
    }
    res.json({ status: 'success', approval });
  });

  // POST /approval/:id/reject
  router.post('/:id/reject', (req: Request, res: Response): void => {
    const reviewedBy = (req.body as { reviewed_by?: string }).reviewed_by ?? 'human';
    const approval = ApprovalStore.reject(req.params.id, reviewedBy);
    if (!approval) {
      res.status(404).json({ status: 'error', message: 'Approval not found or already reviewed' });
      return;
    }
    res.json({ status: 'success', approval });
  });

  return router;
}
