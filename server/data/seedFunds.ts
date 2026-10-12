import { Fund, SifCategory, NavPoint } from '../../src/types/fund.ts';

// Helper to generate business day dates backwards from 2026-10-09
function generateDailyNavSeries(
  endNav: number,
  baseReturn1YPct: number,
  volatility: number,
  seedFactor: number
): { points: NavPoint[]; previousNav: number; high52w: number; low52w: number; sparkline: number[] } {
  const points: NavPoint[] = [];
  const days = 365;
  const endDate = new Date('2026-10-09T00:00:00Z');

  // Generate backwards from endNav
  let current = endNav;
  const tempReversed: { date: string; nav: number }[] = [];
  const dailyDrift = Math.pow(1 + baseReturn1YPct / 100, 1 / 250) - 1;

  let d = new Date(endDate);
  let count = 0;

  while (count < 252) {
    const dayOfWeek = d.getUTCDay();
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = d.toISOString().split('T')[0];
      tempReversed.push({
        date: dateStr,
        nav: Number(current.toFixed(4)),
      });

      // Daily random walk backwards
      const pseudoRand = Math.sin(count * 1.7 + seedFactor * 3.14) * 0.5 + Math.cos(count * 0.9 + seedFactor) * 0.5;
      const step = dailyDrift + pseudoRand * (volatility / 100);
      current = current / (1 + step);
      count++;
    }
    d.setUTCDate(d.getUTCDate() - 1);
  }

  // Reverse to chronological order (oldest to newest)
  const chronological = tempReversed.reverse();
  const navs = chronological.map((p) => p.nav);
  const high52w = Math.max(...navs);
  const low52w = Math.min(...navs);
  const previousNav = chronological.length >= 2 ? chronological[chronological.length - 2].nav : endNav;
  const sparkline = navs.slice(-30);

  return {
    points: chronological,
    previousNav,
    high52w: Number(high52w.toFixed(2)),
    low52w: Number(low52w.toFixed(2)),
    sparkline,
  };
}

export interface RawFundSeed {
  code: string;
  name: string;
  shortName: string;
  amc: string;
  amcCode: string;
  amcAvatarText: string;
  amcBrandColor: string;
  category: SifCategory;
  benchmark: string;
  fundManager: string;
  inceptionDate: string;
  latestNav: number;
  return1YPct: number;
  volatility: number;
  seed: number;
  aumDisclosed: boolean;
  subPlans?: {
    directGrowthLakhs: number;
    directIdcwLakhs: number;
    regularGrowthLakhs: number;
    regularIdcwLakhs: number;
  };
  expenseRatio: number;
}

export const RAW_SEEDS: RawFundSeed[] = [
  // ICICI Prudential AMC
  {
    code: '152101',
    name: 'ICICI Prudential SIF - Long Short Equity Fund - Direct Plan - Growth',
    shortName: 'Long Short Equity Fund',
    amc: 'ICICI Prudential AMC',
    amcCode: 'ICICI_PRU',
    amcAvatarText: 'IP',
    amcBrandColor: '#b91c1c', // Crimson
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Sankaran Naren & Dharmesh Kakkad',
    inceptionDate: '2025-01-15',
    latestNav: 124.68,
    return1YPct: 18.4,
    volatility: 0.75,
    seed: 1,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 148500.0,
      directIdcwLakhs: 23400.0,
      regularGrowthLakhs: 56200.0,
      regularIdcwLakhs: 12100.0,
    },
    expenseRatio: 1.15,
  },
  {
    code: '152102',
    name: 'ICICI Prudential SIF - Active Asset Allocator Fund - Direct Plan - Growth',
    shortName: 'Active Asset Allocator Fund',
    amc: 'ICICI Prudential AMC',
    amcCode: 'ICICI_PRU',
    amcAvatarText: 'IP',
    amcBrandColor: '#b91c1c',
    category: 'Active Asset Allocator',
    benchmark: 'CRISIL Hybrid 50+50 Moderate Index',
    fundManager: 'Manish Banthia & Sri Sharma',
    inceptionDate: '2025-02-10',
    latestNav: 116.32,
    return1YPct: 14.2,
    volatility: 0.6,
    seed: 2,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 92300.0,
      directIdcwLakhs: 14200.0,
      regularGrowthLakhs: 38100.0,
      regularIdcwLakhs: 8900.0,
    },
    expenseRatio: 1.05,
  },
  {
    code: '152103',
    name: 'ICICI Prudential SIF - Ex-Top 100 Long Short Fund - Direct Plan - Growth',
    shortName: 'Ex-Top 100 Long Short Fund',
    amc: 'ICICI Prudential AMC',
    amcCode: 'ICICI_PRU',
    amcAvatarText: 'IP',
    amcBrandColor: '#b91c1c',
    category: 'Equity Ex-Top 100 Long-Short',
    benchmark: 'NIFTY MidSmallcap 400 TRI',
    fundManager: 'Anish Tawakley & Vaibhav Dusad',
    inceptionDate: '2025-03-01',
    latestNav: 129.45,
    return1YPct: 22.8,
    volatility: 1.1,
    seed: 3,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 112000.0,
      directIdcwLakhs: 18500.0,
      regularGrowthLakhs: 41000.0,
      regularIdcwLakhs: 9500.0,
    },
    expenseRatio: 1.25,
  },

  // SBI Funds Management
  {
    code: '152201',
    name: 'SBI SIF - Equity Long-Short Advantage Fund - Direct Plan - Growth',
    shortName: 'Equity Long-Short Advantage',
    amc: 'SBI Funds Management',
    amcCode: 'SBI_MF',
    amcAvatarText: 'SBI',
    amcBrandColor: '#1d4ed8', // Royal Blue
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'R. Srinivasan & Dinesh Balachandran',
    inceptionDate: '2025-01-20',
    latestNav: 122.15,
    return1YPct: 17.6,
    volatility: 0.72,
    seed: 4,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 184000.0,
      directIdcwLakhs: 29800.0,
      regularGrowthLakhs: 71200.0,
      regularIdcwLakhs: 15400.0,
    },
    expenseRatio: 1.1,
  },
  {
    code: '152202',
    name: 'SBI SIF - Sector Rotation Opportunities Fund - Direct Plan - Growth',
    shortName: 'Sector Rotation Opportunities',
    amc: 'SBI Funds Management',
    amcCode: 'SBI_MF',
    amcAvatarText: 'SBI',
    amcBrandColor: '#1d4ed8',
    category: 'Sector Rotation',
    benchmark: 'NIFTY 200 TRI',
    fundManager: 'Mohit Jain & Bhavin Vithlani',
    inceptionDate: '2025-02-18',
    latestNav: 131.9,
    return1YPct: 24.5,
    volatility: 0.95,
    seed: 5,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 88400.0,
      directIdcwLakhs: 12100.0,
      regularGrowthLakhs: 34500.0,
      regularIdcwLakhs: 6700.0,
    },
    expenseRatio: 1.2,
  },
  {
    code: '152203',
    name: 'SBI SIF - Active Asset Allocator Fund - Direct Plan - Growth',
    shortName: 'Active Asset Allocator Fund',
    amc: 'SBI Funds Management',
    amcCode: 'SBI_MF',
    amcAvatarText: 'SBI',
    amcBrandColor: '#1d4ed8',
    category: 'Active Asset Allocator',
    benchmark: 'CRISIL Hybrid 50+50 Moderate Index',
    fundManager: 'Gaurav Mehta',
    inceptionDate: '2025-03-12',
    latestNav: 114.85,
    return1YPct: 13.5,
    volatility: 0.58,
    seed: 6,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 64500.0,
      directIdcwLakhs: 9200.0,
      regularGrowthLakhs: 24100.0,
      regularIdcwLakhs: 5300.0,
    },
    expenseRatio: 1.0,
  },

  // HDFC AMC
  {
    code: '152301',
    name: 'HDFC SIF - Dynamic Long-Short Fund - Direct Plan - Growth',
    shortName: 'Dynamic Long-Short Fund',
    amc: 'HDFC AMC',
    amcCode: 'HDFC_AMC',
    amcAvatarText: 'HDF',
    amcBrandColor: '#047857', // Emerald
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Chirag Setalvad & Gopal Agrawal',
    inceptionDate: '2025-01-25',
    latestNav: 126.35,
    return1YPct: 19.8,
    volatility: 0.8,
    seed: 7,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 165000.0,
      directIdcwLakhs: 26000.0,
      regularGrowthLakhs: 62000.0,
      regularIdcwLakhs: 13500.0,
    },
    expenseRatio: 1.12,
  },
  {
    code: '152302',
    name: 'HDFC SIF - Hybrid Alpha Long-Short Fund - Direct Plan - Growth',
    shortName: 'Hybrid Alpha Long-Short',
    amc: 'HDFC AMC',
    amcCode: 'HDFC_AMC',
    amcAvatarText: 'HDF',
    amcBrandColor: '#047857',
    category: 'Hybrid Long-Short',
    benchmark: 'CRISIL Multi Asset Index',
    fundManager: 'Srinivasan Ramamurthy & Anil Bamboli',
    inceptionDate: '2025-02-05',
    latestNav: 119.7,
    return1YPct: 16.1,
    volatility: 0.65,
    seed: 8,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 98000.0,
      directIdcwLakhs: 15400.0,
      regularGrowthLakhs: 39000.0,
      regularIdcwLakhs: 8200.0,
    },
    expenseRatio: 1.08,
  },
  {
    code: '152303',
    name: 'HDFC SIF - Sector Rotation Alpha Fund - Direct Plan - Growth',
    shortName: 'Sector Rotation Alpha',
    amc: 'HDFC AMC',
    amcCode: 'HDFC_AMC',
    amcAvatarText: 'HDF',
    amcBrandColor: '#047857',
    category: 'Sector Rotation',
    benchmark: 'NIFTY 200 TRI',
    fundManager: 'Roshi Jain',
    inceptionDate: '2025-04-10',
    latestNav: 127.8,
    return1YPct: 21.3,
    volatility: 0.88,
    seed: 9,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 73000.0,
      directIdcwLakhs: 10500.0,
      regularGrowthLakhs: 28400.0,
      regularIdcwLakhs: 5800.0,
    },
    expenseRatio: 1.18,
  },

  // Tata Asset Management
  {
    code: '152401',
    name: 'Tata SIF - Momentum Long-Short Fund - Direct Plan - Growth',
    shortName: 'Momentum Long-Short Fund',
    amc: 'Tata Asset Management',
    amcCode: 'TATA_AMC',
    amcAvatarText: 'TAT',
    amcBrandColor: '#0284c7', // Sky Blue
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Rahul Singh & Sailesh Jain',
    inceptionDate: '2025-02-12',
    latestNav: 125.1,
    return1YPct: 20.1,
    volatility: 0.85,
    seed: 10,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 78000.0,
      directIdcwLakhs: 11200.0,
      regularGrowthLakhs: 29800.0,
      regularIdcwLakhs: 6400.0,
    },
    expenseRatio: 1.15,
  },
  {
    code: '152402',
    name: 'Tata SIF - Active Asset Allocator Fund - Direct Plan - Growth',
    shortName: 'Active Asset Allocator Fund',
    amc: 'Tata Asset Management',
    amcCode: 'TATA_AMC',
    amcAvatarText: 'TAT',
    amcBrandColor: '#0284c7',
    category: 'Active Asset Allocator',
    benchmark: 'CRISIL Hybrid 50+50 Moderate Index',
    fundManager: 'Murthy Nagarajan',
    inceptionDate: '2025-03-20',
    latestNav: 113.4,
    return1YPct: 12.9,
    volatility: 0.55,
    seed: 11,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 52000.0,
      directIdcwLakhs: 7600.0,
      regularGrowthLakhs: 19500.0,
      regularIdcwLakhs: 4100.0,
    },
    expenseRatio: 1.05,
  },

  // Nippon India Mutual Fund
  {
    code: '152501',
    name: 'Nippon India SIF - Market Neutral Long-Short Fund - Direct Plan - Growth',
    shortName: 'Market Neutral Long-Short',
    amc: 'Nippon India Mutual Fund',
    amcCode: 'NIPPON_MF',
    amcAvatarText: 'NIP',
    amcBrandColor: '#c2410c', // Orange-Brown
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Sailesh Raj Bhan & Ashutosh Bhargava',
    inceptionDate: '2025-02-01',
    latestNav: 121.8,
    return1YPct: 16.9,
    volatility: 0.68,
    seed: 12,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 104000.0,
      directIdcwLakhs: 16200.0,
      regularGrowthLakhs: 42100.0,
      regularIdcwLakhs: 9100.0,
    },
    expenseRatio: 1.14,
  },
  {
    code: '152502',
    name: 'Nippon India SIF - Equity Ex-Top 100 Long-Short Fund - Direct Plan - Growth',
    shortName: 'Ex-Top 100 Long-Short Strategy',
    amc: 'Nippon India Mutual Fund',
    amcCode: 'NIPPON_MF',
    amcAvatarText: 'NIP',
    amcBrandColor: '#c2410c',
    category: 'Equity Ex-Top 100 Long-Short',
    benchmark: 'NIFTY MidSmallcap 400 TRI',
    fundManager: 'Samir Rachh & Kinjal Desai',
    inceptionDate: '2025-03-15',
    latestNav: 133.25,
    return1YPct: 25.4,
    volatility: 1.15,
    seed: 13,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 91000.0,
      directIdcwLakhs: 13500.0,
      regularGrowthLakhs: 35000.0,
      regularIdcwLakhs: 7800.0,
    },
    expenseRatio: 1.28,
  },

  // Kotak Mahindra AMC
  {
    code: '152601',
    name: 'Kotak SIF - Equity Ex-Top 100 Long-Short Fund - Direct Plan - Growth',
    shortName: 'Ex-Top 100 Long-Short Fund',
    amc: 'Kotak Mahindra AMC',
    amcCode: 'KOTAK_AMC',
    amcAvatarText: 'KOT',
    amcBrandColor: '#dc2626', // Red
    category: 'Equity Ex-Top 100 Long-Short',
    benchmark: 'NIFTY MidSmallcap 400 TRI',
    fundManager: 'Harsha Upadhyaya & Pankaj Tibrewal',
    inceptionDate: '2025-01-28',
    latestNav: 130.6,
    return1YPct: 23.9,
    volatility: 1.05,
    seed: 14,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 128000.0,
      directIdcwLakhs: 19400.0,
      regularGrowthLakhs: 48500.0,
      regularIdcwLakhs: 10600.0,
    },
    expenseRatio: 1.22,
  },
  {
    code: '152602',
    name: 'Kotak SIF - Macro Asset Allocator Fund - Direct Plan - Growth',
    shortName: 'Macro Asset Allocator Fund',
    amc: 'Kotak Mahindra AMC',
    amcCode: 'KOTAK_AMC',
    amcAvatarText: 'KOT',
    amcBrandColor: '#dc2626',
    category: 'Active Asset Allocator',
    benchmark: 'CRISIL Hybrid 50+50 Moderate Index',
    fundManager: 'Devender Singhal & Abhishek Bisen',
    inceptionDate: '2025-02-22',
    latestNav: 115.9,
    return1YPct: 14.8,
    volatility: 0.62,
    seed: 15,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 76000.0,
      directIdcwLakhs: 11800.0,
      regularGrowthLakhs: 31200.0,
      regularIdcwLakhs: 6900.0,
    },
    expenseRatio: 1.09,
  },

  // 360 ONE Asset
  {
    code: '152701',
    name: '360 ONE SIF - High Conviction Long-Short Fund - Direct Plan - Growth',
    shortName: 'High Conviction Long-Short',
    amc: '360 ONE Asset Management',
    amcCode: '360_ONE',
    amcAvatarText: '360',
    amcBrandColor: '#4f46e5', // Indigo
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Karan Bhagat & Mayur Patel',
    inceptionDate: '2025-01-10',
    latestNav: 128.75,
    return1YPct: 21.6,
    volatility: 0.82,
    seed: 16,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 142000.0,
      directIdcwLakhs: 21500.0,
      regularGrowthLakhs: 53000.0,
      regularIdcwLakhs: 11800.0,
    },
    expenseRatio: 1.2,
  },
  {
    code: '152702',
    name: '360 ONE SIF - Sector Tactical Fund - Direct Plan - Growth',
    shortName: 'Sector Tactical Fund',
    amc: '360 ONE Asset Management',
    amcCode: '360_ONE',
    amcAvatarText: '360',
    amcBrandColor: '#4f46e5',
    category: 'Sector Rotation',
    benchmark: 'NIFTY 200 TRI',
    fundManager: 'Parijat Garg',
    inceptionDate: '2025-03-05',
    latestNav: 123.4,
    return1YPct: 18.2,
    volatility: 0.86,
    seed: 17,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 67000.0,
      directIdcwLakhs: 9800.0,
      regularGrowthLakhs: 25400.0,
      regularIdcwLakhs: 5600.0,
    },
    expenseRatio: 1.18,
  },

  // Quant Mutual Fund
  {
    code: '152801',
    name: 'Quant SIF - Dynamic Alpha Long-Short Fund - Direct Plan - Growth',
    shortName: 'Dynamic Alpha Long-Short',
    amc: 'Quant Mutual Fund',
    amcCode: 'QUANT_MF',
    amcAvatarText: 'QNT',
    amcBrandColor: '#7c3aed', // Violet
    category: 'Hybrid Long-Short',
    benchmark: 'CRISIL Multi Asset Index',
    fundManager: 'Sandeep Tandon & Sanjeev Sharma',
    inceptionDate: '2025-01-18',
    latestNav: 135.2,
    return1YPct: 27.5,
    volatility: 1.25,
    seed: 18,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 154000.0,
      directIdcwLakhs: 22800.0,
      regularGrowthLakhs: 58000.0,
      regularIdcwLakhs: 12900.0,
    },
    expenseRatio: 1.24,
  },
  {
    code: '152802',
    name: 'Quant SIF - Predictive Momentum Long-Short Fund - Direct Plan - Growth',
    shortName: 'Predictive Momentum Long-Short',
    amc: 'Quant Mutual Fund',
    amcCode: 'QUANT_MF',
    amcAvatarText: 'QNT',
    amcBrandColor: '#7c3aed',
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Sandeep Tandon & Ankit Pande',
    inceptionDate: '2025-02-28',
    latestNav: 138.9,
    return1YPct: 29.8,
    volatility: 1.3,
    seed: 19,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 119000.0,
      directIdcwLakhs: 17200.0,
      regularGrowthLakhs: 44600.0,
      regularIdcwLakhs: 9800.0,
    },
    expenseRatio: 1.25,
  },

  // Edelweiss AMC
  {
    code: '152901',
    name: 'Edelweiss SIF - Alternative Equity Long-Short Fund - Direct Plan - Growth',
    shortName: 'Alternative Equity Long-Short',
    amc: 'Edelweiss AMC',
    amcCode: 'EDELWEISS_AMC',
    amcAvatarText: 'EDL',
    amcBrandColor: '#0891b2', // Cyan
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Radhika Gupta & Trideep Bhattacharya',
    inceptionDate: '2025-02-14',
    latestNav: 120.45,
    return1YPct: 15.8,
    volatility: 0.7,
    seed: 20,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 82000.0,
      directIdcwLakhs: 12400.0,
      regularGrowthLakhs: 31000.0,
      regularIdcwLakhs: 6800.0,
    },
    expenseRatio: 1.15,
  },
  {
    code: '152902',
    name: 'Edelweiss SIF - Multi-Asset Dynamic Allocator Fund - Direct Plan - Growth',
    shortName: 'Multi-Asset Dynamic Allocator',
    amc: 'Edelweiss AMC',
    amcCode: 'EDELWEISS_AMC',
    amcAvatarText: 'EDL',
    amcBrandColor: '#0891b2',
    category: 'Active Asset Allocator',
    benchmark: 'CRISIL Hybrid 50+50 Moderate Index',
    fundManager: 'Bharat Lahoti & Bhavesh Jain',
    inceptionDate: '2025-03-18',
    latestNav: 114.2,
    return1YPct: 13.1,
    volatility: 0.59,
    seed: 21,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 58000.0,
      directIdcwLakhs: 8600.0,
      regularGrowthLakhs: 22100.0,
      regularIdcwLakhs: 4800.0,
    },
    expenseRatio: 1.06,
  },

  // WhiteOak Capital AMC
  {
    code: '153001',
    name: 'WhiteOak SIF - Specialised Equity Long-Short Fund - Direct Plan - Growth',
    shortName: 'Specialised Equity Long-Short',
    amc: 'WhiteOak Capital AMC',
    amcCode: 'WHITEOAK_AMC',
    amcAvatarText: 'WO',
    amcBrandColor: '#334155', // Slate
    category: 'Equity Long-Short',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Prashant Khemka & Ramesh Mantri',
    inceptionDate: '2025-02-25',
    latestNav: 125.8,
    return1YPct: 19.4,
    volatility: 0.78,
    seed: 22,
    aumDisclosed: true,
    subPlans: {
      directGrowthLakhs: 94000.0,
      directIdcwLakhs: 14100.0,
      regularGrowthLakhs: 36200.0,
      regularIdcwLakhs: 7900.0,
    },
    expenseRatio: 1.2,
  },
  {
    code: '153002',
    name: 'WhiteOak SIF - Alpha Ex-Top 100 Long-Short Strategy - Direct Plan - Growth',
    shortName: 'Alpha Ex-Top 100 Strategy',
    amc: 'WhiteOak Capital AMC',
    amcCode: 'WHITEOAK_AMC',
    amcAvatarText: 'WO',
    amcBrandColor: '#334155',
    category: 'Equity Ex-Top 100 Long-Short',
    benchmark: 'NIFTY MidSmallcap 400 TRI',
    fundManager: 'Trupti Agrawal & Dheeresh Pathak',
    inceptionDate: '2026-08-01',
    latestNav: 104.5,
    return1YPct: 4.5,
    volatility: 0.9,
    seed: 23,
    aumDisclosed: false, // Pending disclosure demo!
    expenseRatio: 1.25,
  },
];

// Helper to construct fully computed Fund objects and their Nav Histories
export interface SeedDataset {
  funds: Fund[];
  navHistoryMap: Map<string, NavPoint[]>;
}

export function buildSeedDataset(): SeedDataset {
  const navHistoryMap = new Map<string, NavPoint[]>();
  const initialFunds: Fund[] = [];

  // Step 1: Precompute Fund items & NAV points
  for (const raw of RAW_SEEDS) {
    const { points, previousNav, high52w, low52w, sparkline } = generateDailyNavSeries(
      raw.latestNav,
      raw.return1YPct,
      raw.volatility,
      raw.seed
    );

    navHistoryMap.set(raw.code, points);

    let schemeAumLakhs: number | undefined = undefined;
    let schemeAumCr: number | undefined = undefined;

    if (raw.aumDisclosed && raw.subPlans) {
      const totalLakhs =
        raw.subPlans.directGrowthLakhs +
        raw.subPlans.directIdcwLakhs +
        raw.subPlans.regularGrowthLakhs +
        raw.subPlans.regularIdcwLakhs;
      schemeAumLakhs = totalLakhs;
      // Formula: aumCr = aumLakhs / 100
      schemeAumCr = Number((totalLakhs / 100).toFixed(2));
    }

    const navChange = Number((raw.latestNav - previousNav).toFixed(4));
    const navChangePct = Number(((navChange / previousNav) * 100).toFixed(2));

    initialFunds.push({
      code: raw.code,
      name: raw.name,
      shortName: raw.shortName,
      amc: raw.amc,
      amcCode: raw.amcCode,
      amcAvatarText: raw.amcAvatarText,
      amcBrandColor: raw.amcBrandColor,
      category: raw.category,
      benchmark: raw.benchmark,
      fundManager: raw.fundManager,
      inceptionDate: raw.inceptionDate,
      minTicket: 1000000, // ₹10 Lakhs
      expenseRatio: raw.expenseRatio,
      isGrowth: true,

      latestNav: raw.latestNav,
      navDate: '2026-10-09',
      previousNav,
      navChange,
      navChangePct,

      aumDisclosed: raw.aumDisclosed,
      subPlans: raw.subPlans,
      schemeAumLakhs,
      schemeAumCr,
      categoryAumCr: 0, // Computed in Step 2
      aumReportingDate: raw.aumDisclosed ? '30-Sep-2026' : undefined,

      sparkline,
      high52w,
      low52w,
    });
  }

  // Step 2: Calculate Category Totals (sum of schemeAumCr by category)
  const categoryTotals: Record<string, number> = {};
  for (const f of initialFunds) {
    if (f.schemeAumCr) {
      categoryTotals[f.category] = (categoryTotals[f.category] || 0) + f.schemeAumCr;
    }
  }

  for (const f of initialFunds) {
    f.categoryAumCr = Number((categoryTotals[f.category] || 0).toFixed(2));
  }

  return {
    funds: initialFunds,
    navHistoryMap,
  };
}
