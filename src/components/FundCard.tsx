import React, { useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Layers, Calendar, ShieldCheck, ChevronDown } from 'lucide-react';
import { AmcFamily, Fund } from '../types/fund.ts';
import { formatAumCr, formatNav, formatPct, formatAmfiDate, formatINR } from '../utils/formatters.ts';
import { MicroSparkline } from './MicroSparkline.tsx';

interface FundCardProps {
  amcFamily: AmcFamily;
  onOpenModal: (fund: Fund) => void;
  selectedFundCode?: string;
}

export const FundCard: React.FC<FundCardProps> = ({
  amcFamily,
  onOpenModal,
  selectedFundCode,
}) => {
  // If a specific fund code was selected from outside, use it; otherwise default to the first fund
  const [currentCode, setCurrentCode] = useState<string>(
    selectedFundCode && amcFamily.funds.some((f) => f.code === selectedFundCode)
      ? selectedFundCode
      : amcFamily.funds[0]?.code
  );

  // Synchronize if prop changes externally
  React.useEffect(() => {
    if (selectedFundCode && amcFamily.funds.some((f) => f.code === selectedFundCode)) {
      setCurrentCode(selectedFundCode);
    }
  }, [selectedFundCode, amcFamily.funds]);

  const activeFund =
    amcFamily.funds.find((f) => f.code === currentCode) || amcFamily.funds[0];

  if (!activeFund) return null;

  const isPositive = activeFund.navChange >= 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 hover:bg-slate-900/95 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20 group">
      {/* Top Header: AMC Avatar, Name, and Strategy Switcher */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar Badge with Initials */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md ring-1 ring-white/10"
              style={{ backgroundColor: amcFamily.amcBrandColor || '#4f46e5' }}
            >
              {amcFamily.amcAvatarText}
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <span>{amcFamily.amc}</span>
                <span className="text-slate-400">·</span>
                <span className="text-indigo-400 font-mono text-[11px]">
                  {amcFamily.funds.length} {amcFamily.funds.length === 1 ? 'Strategy' : 'Strategies'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-100 tracking-tight group-hover:text-indigo-300 transition-colors">
                {activeFund.shortName}
              </h3>
            </div>
          </div>

          {/* SIF Minimum Ticket Badge */}
          <div className="shrink-0 text-right">
            <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
              Min. Ticket
            </span>
            <span className="text-xs font-mono font-semibold text-slate-200">
              {formatINR(activeFund.minTicket, { decimals: 0 })}
            </span>
          </div>
        </div>

        {/* Strategy Switcher Dropdown (when AMC has multiple strategies) */}
        {amcFamily.funds.length > 1 ? (
          <div className="mb-4">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Select AMC Strategy Variant:
            </label>
            <div className="relative">
              <select
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="w-full appearance-none bg-slate-950/80 border border-slate-800 text-xs text-slate-200 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-sans cursor-pointer hover:border-slate-700"
              >
                {amcFamily.funds.map((f) => (
                  <option key={f.code} value={f.code} className="bg-slate-900 text-slate-200 py-1">
                    {f.shortName} ({f.category})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="text-slate-400 font-mono">Category:</span>
            <span className="text-slate-200">{activeFund.category}</span>
          </div>
        )}

        {/* NAV Display + Trend Sparkline Section */}
        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/50 mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Latest NAV</span>
              <span className="text-slate-400">·</span>
              <span className="text-[10px] text-slate-400">Direct Growth</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                {formatNav(activeFund.latestNav)}
              </span>
              <div
                className={`flex items-center text-xs font-mono font-semibold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                )}
                <span>{formatPct(activeFund.navChangePct)}</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Valuation: {formatAmfiDate(activeFund.navDate)}</span>
            </div>
          </div>

          {/* Micro SVG Sparkline */}
          <div className="shrink-0 flex flex-col items-end">
            <MicroSparkline data={activeFund.sparkline} isPositive={isPositive} height={38} />
            <span className="text-[10px] font-mono text-slate-400 mt-1">30-day trajectory</span>
          </div>
        </div>

        {/* AAUM Breakdown Display: Scheme AUM vs Category AUM */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Scheme Level AAUM */}
          <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/40">
            <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
              <span>Scheme AAUM</span>
              <span className="text-[9px] font-mono text-slate-400">4 Sub-Plans</span>
            </div>
            <div className="text-sm font-semibold font-mono text-slate-100">
              {formatAumCr(activeFund.schemeAumCr, { pendingFallback: 'Pending disclosure' })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              {activeFund.aumReportingDate ? `Qtr ended ${activeFund.aumReportingDate}` : 'Unreported'}
            </div>
          </div>

          {/* Category Level Total AAUM */}
          <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/40">
            <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
              <span>Category AAUM</span>
              <span className="text-[9px] font-mono text-slate-400">SEBI Total</span>
            </div>
            <div className="text-sm font-semibold font-mono text-indigo-300">
              {formatAumCr(activeFund.categoryAumCr, { pendingFallback: 'Pending disclosure' })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {activeFund.category}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata and Deep Dive Trigger */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-400 truncate">
          <span className="text-slate-400 font-mono">BM:</span> {activeFund.benchmark}
        </div>

        <button
          onClick={() => onOpenModal(activeFund)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <span>Deep Dive</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
