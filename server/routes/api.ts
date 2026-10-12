import { Router, Request, Response } from 'express';
import {
  getAllFunds,
  getFundByCode,
  getNavHistory,
  syncNavPipeline,
  syncAumPipeline,
  getDbStatus,
} from '../db.ts';

export const apiRouter = Router();

// GET /api/funds: Fetch active growth schemes with latest NAV and AUM
apiRouter.get('/funds', async (req: Request, res: Response) => {
  try {
    const { category, amc, search } = req.query;
    const funds = await getAllFunds({
      category: typeof category === 'string' ? category : undefined,
      amc: typeof amc === 'string' ? amc : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
    res.json({
      success: true,
      count: funds.length,
      funds,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/history: Fetch time-series NAV history by fund code and range
apiRouter.get('/history', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const range = (req.query.range as any) || '1Y';

    if (!code) {
      return res.status(400).json({ success: false, error: 'Missing required query parameter: code' });
    }

    const history = await getNavHistory(code, range);
    res.json({
      success: true,
      history,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sync: Authenticated sync pipeline for daily AMFI NAV ingestion
apiRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    // Check optional auth header if provided, but allow in UI demo
    const authHeader = req.headers.authorization;
    if (process.env.SYNC_SECRET && authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid sync authorization token' });
    }

    const result = await syncNavPipeline();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sync-aum: Ingestion endpoint to parse and persist AAUM records
apiRouter.post('/sync-aum', async (req: Request, res: Response) => {
  try {
    const result = await syncAumPipeline();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/status: Check database & pipeline health
apiRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await getDbStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
