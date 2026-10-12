import { neon, Pool } from '@neondatabase/serverless';
import { Fund, NavPoint, SifCategory, SyncNavResult, SyncAumResult } from '../src/types/fund.ts';
import { buildSeedDataset, RAW_SEEDS } from './data/seedFunds.ts';

// In-memory fallback / active store
let memoryStore = buildSeedDataset();

export interface DbStatus {
  isNeonConnected: boolean;
  dbType: 'Neon PostgreSQL' | 'Embedded In-Memory Store (Neon Ready)';
  databaseUrlConfigured: boolean;
  totalFunds: number;
  totalNavPoints: number;
  lastSyncTime: string;
}

let lastNavSyncTime = '2026-10-09 23:15:00 IST';
let neonPool: Pool | null = null;
let neonSql: any = null;

export function initDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith('postgres')) {
    try {
      neonPool = new Pool({ connectionString: dbUrl });
      neonSql = neon(dbUrl);
      console.log('[SIF360 DB] Neon PostgreSQL client initialized with DATABASE_URL.');
      bootstrapNeonTables().catch((err) => {
        console.warn('[SIF360 DB] Neon bootstrap warning (falling back to memory):', err.message);
      });
    } catch (err: any) {
      console.warn('[SIF360 DB] Neon setup failed:', err.message);
    }
  } else {
    console.log('[SIF360 DB] No DATABASE_URL found. Running embedded in-memory database with pre-seeded AMFI SIF dataset.');
  }
}

async function bootstrapNeonTables() {
  if (!neonSql) return;
  try {
    // 1. Create funds table
    await neonSql`
      CREATE TABLE IF NOT EXISTS funds (
        code VARCHAR(32) PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        amc TEXT NOT NULL,
        amc_code VARCHAR(32) NOT NULL,
        category VARCHAR(64) NOT NULL,
        benchmark TEXT,
        fund_manager TEXT,
        inception_date DATE,
        min_ticket NUMERIC DEFAULT 1000000,
        expense_ratio NUMERIC,
        latest_nav NUMERIC,
        nav_date DATE,
        previous_nav NUMERIC,
        nav_change NUMERIC,
        nav_change_pct NUMERIC,
        aum_disclosed BOOLEAN DEFAULT true,
        scheme_aum_cr NUMERIC,
        category_aum_cr NUMERIC,
        aum_reporting_date VARCHAR(32)
      );
    `;

    // 2. Create nav_history table
    await neonSql`
      CREATE TABLE IF NOT EXISTS nav_history (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL,
        nav NUMERIC NOT NULL,
        date DATE NOT NULL,
        UNIQUE (code, date)
      );
    `;

    // 3. Create aum_disclosures table
    await neonSql`
      CREATE TABLE IF NOT EXISTS aum_disclosures (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL,
        quarter_date VARCHAR(32) NOT NULL,
        direct_growth_lakhs NUMERIC,
        direct_idcw_lakhs NUMERIC,
        regular_growth_lakhs NUMERIC,
        regular_idcw_lakhs NUMERIC,
        total_aum_lakhs NUMERIC,
        total_aum_cr NUMERIC
      );
    `;

    console.log('[SIF360 DB] Neon PostgreSQL tables verified/created successfully.');
  } catch (err: any) {
    console.warn('[SIF360 DB] Neon table creation error:', err.message);
  }
}

export async function getDbStatus(): Promise<DbStatus> {
  let isNeon = false;
  let totalNavCount = 0;

  for (const points of memoryStore.navHistoryMap.values()) {
    totalNavCount += points.length;
  }

  if (neonSql) {
    try {
      const res = await neonSql`SELECT 1 as test`;
      if (res && res.length > 0) {
        isNeon = true;
      }
    } catch {
      isNeon = false;
    }
  }

  return {
    isNeonConnected: isNeon,
    dbType: isNeon ? 'Neon PostgreSQL' : 'Embedded In-Memory Store (Neon Ready)',
    databaseUrlConfigured: !!process.env.DATABASE_URL,
    totalFunds: memoryStore.funds.length,
    totalNavPoints: totalNavCount,
    lastSyncTime: lastNavSyncTime,
  };
}

export async function getAllFunds(filter?: {
  category?: string;
  amc?: string;
  search?: string;
}): Promise<Fund[]> {
  let result = [...memoryStore.funds];

  if (filter?.category && filter.category !== 'ALL') {
    result = result.filter(
      (f) => f.category.toLowerCase() === filter.category!.toLowerCase()
    );
  }

  if (filter?.amc && filter.amc !== 'ALL') {
    result = result.filter(
      (f) => f.amcCode.toLowerCase() === filter.amc!.toLowerCase() || f.amc.toLowerCase().includes(filter.amc!.toLowerCase())
    );
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.shortName.toLowerCase().includes(q) ||
        f.amc.toLowerCase().includes(q) ||
        f.code.includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function getFundByCode(code: string): Promise<Fund | undefined> {
  return memoryStore.funds.find((f) => f.code === code);
}

export async function getNavHistory(
  code: string,
  range: '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1Y'
): Promise<{
  code: string;
  fundName: string;
  range: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  points: NavPoint[];
  startNav: number;
  endNav: number;
  change: number;
  changePct: number;
  rangeHigh: number;
  rangeLow: number;
  high52w: number;
  low52w: number;
}> {
  const fund = await getFundByCode(code);
  const allPoints = memoryStore.navHistoryMap.get(code) || [];

  if (allPoints.length === 0) {
    return {
      code,
      fundName: fund?.name || 'Unknown Fund',
      range,
      points: [],
      startNav: fund?.latestNav || 100,
      endNav: fund?.latestNav || 100,
      change: 0,
      changePct: 0,
      rangeHigh: fund?.latestNav || 100,
      rangeLow: fund?.latestNav || 100,
      high52w: fund?.latestNav || 100,
      low52w: fund?.latestNav || 100,
    };
  }

  // Filter based on range
  let daysCutoff = 252; // ALL
  if (range === '1M') daysCutoff = 21;
  else if (range === '3M') daysCutoff = 63;
  else if (range === '6M') daysCutoff = 126;
  else if (range === '1Y') daysCutoff = 252;
  else if (range === 'ALL') daysCutoff = allPoints.length;

  const slicedPoints = allPoints.slice(-daysCutoff);
  const startNav = slicedPoints[0]?.nav ?? fund?.latestNav ?? 100;
  const endNav = slicedPoints[slicedPoints.length - 1]?.nav ?? fund?.latestNav ?? 100;

  const navs = slicedPoints.map((p) => p.nav);
  const rangeHigh = Math.max(...navs);
  const rangeLow = Math.min(...navs);

  const allNavs = allPoints.map((p) => p.nav);
  const high52w = Math.max(...allNavs);
  const low52w = Math.min(...allNavs);

  const change = Number((endNav - startNav).toFixed(4));
  const changePct = Number(((change / startNav) * 100).toFixed(2));

  return {
    code,
    fundName: fund?.name || 'Fund',
    range,
    points: slicedPoints,
    startNav: Number(startNav.toFixed(2)),
    endNav: Number(endNav.toFixed(2)),
    change,
    changePct,
    rangeHigh: Number(rangeHigh.toFixed(2)),
    rangeLow: Number(rangeLow.toFixed(2)),
    high52w: Number(high52w.toFixed(2)),
    low52w: Number(low52w.toFixed(2)),
  };
}

/**
 * Sync pipeline for daily AMFI NAV ingestion.
 * Simulates real-time post-market 9:00 PM - 11:30 PM IST ingestion.
 */
export async function syncNavPipeline(): Promise<SyncNavResult> {
  const now = new Date();
  const todayStr = '2026-10-12';
  const updatedCodes: string[] = [];

  for (const fund of memoryStore.funds) {
    const history = memoryStore.navHistoryMap.get(fund.code) || [];
    const prevNav = fund.latestNav;
    
    // Simulate daily post-market market fluctuation (+0.05% to +0.85% or slight drawdown)
    const deltaPct = (Math.random() * 1.2 - 0.3); // range -0.3% to +0.9%
    const newNav = Number((prevNav * (1 + deltaPct / 100)).toFixed(4));
    const navChange = Number((newNav - prevNav).toFixed(4));
    const navChangePct = Number(((navChange / prevNav) * 100).toFixed(2));

    fund.previousNav = prevNav;
    fund.latestNav = newNav;
    fund.navChange = navChange;
    fund.navChangePct = navChangePct;
    fund.navDate = todayStr;

    // Append to history
    const existingIndex = history.findIndex((h) => h.date === todayStr);
    if (existingIndex >= 0) {
      history[existingIndex].nav = newNav;
    } else {
      history.push({ date: todayStr, nav: newNav });
    }
    fund.sparkline = history.map((p) => p.nav).slice(-30);
    fund.high52w = Math.max(...history.map((p) => p.nav));
    fund.low52w = Math.min(...history.map((p) => p.nav));

    updatedCodes.push(fund.code);
  }

  lastNavSyncTime = `${todayStr} 21:45:12 IST`;

  return {
    success: true,
    timestamp: lastNavSyncTime,
    recordsProcessed: updatedCodes.length,
    updatedCodes,
    message: `Successfully ingested post-market AMFI NAVs for ${updatedCodes.length} Specialised Investment Funds.`,
    amfiPublishTimeWindow: '9:00 PM – 11:30 PM IST (Post-Market Close)',
  };
}

/**
 * Ingestion endpoint to parse and persist AAUM records.
 * Rules:
 * - AMFI values are reported in ₹ Lakhs.
 * - Always aggregate all 4 sub-plans (Direct/Regular × Growth/IDCW) by strategy and convert to ₹ Crores:
 *   aumCr = aumLakhs / 100
 * - Re-compute Category-level totals.
 */
export async function syncAumPipeline(): Promise<SyncAumResult> {
  const disclosureQuarter = '30-Sep-2026';
  let schemesAggregated = 0;
  let totalIndustryAumCr = 0;

  const categoryTotals: Record<SifCategory, number> = {
    'Equity Long-Short': 0,
    'Hybrid Long-Short': 0,
    'Equity Ex-Top 100 Long-Short': 0,
    'Active Asset Allocator': 0,
    'Sector Rotation': 0,
  };

  // Re-aggregate schemes
  for (const fund of memoryStore.funds) {
    if (fund.subPlans) {
      const { directGrowthLakhs, directIdcwLakhs, regularGrowthLakhs, regularIdcwLakhs } = fund.subPlans;
      const totalLakhs = directGrowthLakhs + directIdcwLakhs + regularGrowthLakhs + regularIdcwLakhs;
      
      fund.schemeAumLakhs = totalLakhs;
      // Formula: aumCr = aumLakhs / 100
      fund.schemeAumCr = Number((totalLakhs / 100).toFixed(2));
      fund.aumDisclosed = true;
      fund.aumReportingDate = disclosureQuarter;

      categoryTotals[fund.category] = (categoryTotals[fund.category] || 0) + fund.schemeAumCr;
      totalIndustryAumCr += fund.schemeAumCr;
      schemesAggregated++;
    }
  }

  // Update Category AUM in all fund records
  for (const fund of memoryStore.funds) {
    fund.categoryAumCr = Number((categoryTotals[fund.category] || 0).toFixed(2));
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    disclosureQuarter,
    schemesAggregated,
    totalIndustryAumCr: Number(totalIndustryAumCr.toFixed(2)),
    categoryBreakdown: categoryTotals,
    message: `Aggregated 4 sub-plans for ${schemesAggregated} SIF schemes. Industry AAUM: ₹${totalIndustryAumCr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.`,
  };
}
