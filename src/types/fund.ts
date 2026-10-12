export type SifCategory =
  | 'Equity Long-Short'
  | 'Hybrid Long-Short'
  | 'Equity Ex-Top 100 Long-Short'
  | 'Active Asset Allocator'
  | 'Sector Rotation';

export interface SubPlansAum {
  directGrowthLakhs: number;
  directIdcwLakhs: number;
  regularGrowthLakhs: number;
  regularIdcwLakhs: number;
}

export interface NavPoint {
  date: string; // ISO date 'YYYY-MM-DD'
  nav: number;
}

export interface Fund {
  code: string; // AMFI Scheme Code
  name: string; // Full scheme name
  shortName: string; // Strategy label for switcher
  amc: string; // AMC Name, e.g., 'ICICI Prudential AMC'
  amcCode: string; // E.g., 'ICICI_PRU'
  amcAvatarText: string; // E.g., 'IP'
  amcBrandColor: string; // Hex or tailwind class
  category: SifCategory;
  benchmark: string;
  fundManager: string;
  inceptionDate: string;
  minTicket: number; // ₹10,00,000 for SIFs
  expenseRatio: number; // Percentage, e.g. 1.25
  isGrowth: boolean;

  // Latest NAV State
  latestNav: number;
  navDate: string; // Formatted or ISO
  previousNav: number;
  navChange: number;
  navChangePct: number;

  // AAUM State
  aumDisclosed: boolean;
  subPlans?: SubPlansAum;
  schemeAumLakhs?: number;
  schemeAumCr?: number; // schemeAumLakhs / 100
  categoryAumCr?: number; // Total AUM of all funds in category
  aumReportingDate?: string; // E.g. '30-Sep-2026'

  // Sparkline data (recent 30 days)
  sparkline?: number[];
  
  // 52-week High/Low
  high52w?: number;
  low52w?: number;
}

export interface AmcFamily {
  amc: string;
  amcCode: string;
  amcAvatarText: string;
  amcBrandColor: string;
  funds: Fund[];
  totalAmcAumCr: number;
}

export interface NavHistoryResponse {
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
}

export interface SyncNavResult {
  success: boolean;
  timestamp: string;
  recordsProcessed: number;
  updatedCodes: string[];
  message: string;
  amfiPublishTimeWindow: string;
}

export interface SyncAumResult {
  success: boolean;
  timestamp: string;
  disclosureQuarter: string;
  schemesAggregated: number;
  totalIndustryAumCr: number;
  categoryBreakdown: Record<SifCategory, number>;
  message: string;
}
