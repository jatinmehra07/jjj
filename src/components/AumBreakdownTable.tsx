import React from 'react';
import { SubPlansAum } from '../types/fund.ts';
import { formatAumCr, formatAumLakhs, formatINR } from '../utils/formatters.ts';
import { PieChart, Info } from 'lucide-react';

interface AumBreakdownTableProps {
  subPlans?: SubPlansAum;
  schemeAumCr?: number;
  schemeAumLakhs?: number;
  reportingDate?: string;
  categoryAumCr?: number;
  categoryName: string;
}

export const AumBreakdownTable: React.FC<AumBreakdownTableProps> = ({
  subPlans,
  schemeAumCr,
  schemeAumLakhs,
  reportingDate,
  categoryAumCr,
  categoryName,
}) => {
  if (!subPlans) {
    return (
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
        <p className="text-sm text-slate-400">Quarterly AAUM disclosure not yet filed with AMFI.</p>
        <p className="text-xs text-slate-400 mt-1">
          SEBI mandates quarterly disclosures within 10 days of quarter close.
        </p>
      </div>
    );
  }

  const { directGrowthLakhs, directIdcwLakhs, regularGrowthLakhs, regularIdcwLakhs } = subPlans;
  const totalLakhs = schemeAumLakhs || directGrowthLakhs + directIdcwLakhs + regularGrowthLakhs + regularIdcwLakhs;
  const totalCr = schemeAumCr || totalLakhs / 100;

  // Plan percentages
  const plans = [
    {
      name: 'Direct Plan — Growth',
      lakhs: directGrowthLakhs,
      cr: directGrowthLakhs / 100,
      share: totalLakhs > 0 ? (directGrowthLakhs / totalLakhs) * 100 : 0,
      color: 'bg-emerald-500',
    },
    {
      name: 'Direct Plan — IDCW',
      lakhs: directIdcwLakhs,
      cr: directIdcwLakhs / 100,
      share: totalLakhs > 0 ? (directIdcwLakhs / totalLakhs) * 100 : 0,
      color: 'bg-teal-500',
    },
    {
      name: 'Regular Plan — Growth',
      lakhs: regularGrowthLakhs,
      cr: regularGrowthLakhs / 100,
      share: totalLakhs > 0 ? (regularGrowthLakhs / totalLakhs) * 100 : 0,
      color: 'bg-indigo-500',
    },
    {
      name: 'Regular Plan — IDCW',
      lakhs: regularIdcwLakhs,
      cr: regularIdcwLakhs / 100,
      share: totalLakhs > 0 ? (regularIdcwLakhs / totalLakhs) * 100 : 0,
      color: 'bg-violet-500',
    },
  ];

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
      {/* Header with aggregation formula reminder */}
      <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-800/60">
        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quarterly AAUM Aggregation (4 Sub-Plans)</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Raw AMFI disclosures in ₹ Lakhs &middot; Formula: <span className="font-mono text-slate-300">AUM (₹ Cr) = Sum(Sub-Plans Lakhs) / 100</span>
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Disclosure Date</span>
          <div className="text-xs font-mono font-medium text-slate-200">
            {reportingDate || '30-Sep-2026'}
          </div>
        </div>
      </div>

      {/* Progress Split Bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex mb-3 bg-slate-800">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`${p.color} transition-all duration-300`}
            style={{ width: `${p.share}%` }}
            title={`${p.name}: ${p.share.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Sub-plans breakdown rows */}
      <div className="divide-y divide-slate-800/40 text-xs font-mono">
        {plans.map((plan, idx) => (
          <div key={idx} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${plan.color}`} />
              <span className="text-slate-300 font-sans">{plan.name}</span>
            </div>
            <div className="flex items-center gap-4 text-right">
              <span className="text-slate-400 text-[11px]">{formatAumLakhs(plan.lakhs)}</span>
              <span className="text-slate-200 font-semibold w-24">
                {formatAumCr(plan.cr)}
              </span>
              <span className="text-indigo-400 text-[11px] w-12 text-right">
                {plan.share.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Scheme and Category summary footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400">Total Strategy AAUM:</span>
          <span className="font-mono font-bold text-slate-100 ml-1.5 text-sm">
            {formatAumCr(totalCr)}
          </span>
          <span className="text-slate-400 text-[11px] ml-1 font-mono">({formatAumLakhs(totalLakhs)})</span>
        </div>

        {categoryAumCr && (
          <div className="text-right">
            <span className="text-slate-400 text-[11px]">{categoryName} Total:</span>
            <span className="font-mono font-semibold text-indigo-300 ml-1.5">
              {formatAumCr(categoryAumCr)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
