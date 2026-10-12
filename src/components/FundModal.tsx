import React, { useState } from 'react';
import useSWR from 'swr';
import { X, Calendar, Layers, ShieldCheck, TrendingUp, TrendingDown, ArrowUpRight, BarChart3, Clock, DollarSign } from 'lucide-react';
import { Fund, NavHistoryResponse } from '../types/fund.ts';
import { formatAumCr, formatNav, formatPct, formatAmfiDate, formatINR } from '../utils/formatters.ts';
import { InteractiveSvgChart } from './InteractiveSvgChart.tsx';
import { AumBreakdownTable } from './AumBreakdownTable.tsx';

interface FundModalProps {
  fund: Fund | null;
  onClose: () => void;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const FundModal: React.FC<FundModalProps> = ({ fund, onClose }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1Y');
  const [activeTab, setActiveTab] = useState<'chart' | 'aum_breakdown'>('chart');

  // Fetch real-time time-series NAV history via SWR
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    history: NavHistoryResponse;
  }>(fund ? `/api/history?code=${fund.code}&range=${selectedRange}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  if (!fund) return null;

  const history = data?.history;
  const isPositive = (history?.changePct ?? fund.navChangePct) >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/80 flex flex-col focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 sticky top-0 bg-slate-900/95 backdrop-blur z-20 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0 shadow-md ring-1 ring-white/10"
              style={{ backgroundColor: fund.amcBrandColor || '#4f46e5' }}
            >
              {fund.amcAvatarText}
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">{fund.amc}</span>
                <span>·</span>
                <span className="font-mono text-indigo-400">AMFI #{fund.code}</span>
                <span>·</span>
                <span className="text-slate-400 font-mono">SEBI SIF Strategy</span>
              </div>
              <h2 id="modal-title" className="text-xl font-bold text-slate-100 tracking-tight">
                {fund.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="text-indigo-300 font-medium">{fund.category}</span>
                <span>·</span>
                <span>Benchmark: <strong className="text-slate-300">{fund.benchmark}</strong></span>
                <span>·</span>
                <span>Manager: <strong className="text-slate-300">{fund.fundManager}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Latest NAV
              </span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {formatNav(fund.latestNav)}
              </div>
              <div
                className={`text-xs font-mono font-semibold mt-0.5 ${
                  fund.navChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPct(fund.navChangePct)} ({formatNav(fund.navChange)})
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Scheme AAUM
              </span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {formatAumCr(fund.schemeAumCr, { pendingFallback: 'Pending' })}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Qtr {fund.aumReportingDate || 'Pending'}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Category AAUM
              </span>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5">
                {formatAumCr(fund.categoryAumCr, { pendingFallback: '—' })}
              </div>
              <div className="text-xs text-slate-400 truncate mt-0.5">
                {fund.category}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                SEBI Min Ticket
              </span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {formatINR(fund.minTicket, { decimals: 0 })}
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-0.5">
                Specialised Fund
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Zero-pill design, subtle underline tabs) */}
          <div className="flex items-center gap-6 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('chart')}
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === 'chart'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>NAV History & Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('aum_breakdown')}
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === 'aum_breakdown'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>4 Sub-Plans AAUM Aggregation</span>
            </button>
          </div>

          {/* Tab 1: Chart View */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              {/* Range Selector Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                  {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                        selectedRange === range
                          ? 'bg-indigo-600 text-white shadow-sm font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Daily AMFI Ingestion Window: 9:00 PM – 11:30 PM IST</span>
                </div>
              </div>

              {/* Metric Callout Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {selectedRange} Return
                  </span>
                  <div
                    className={`text-base font-bold font-mono mt-0.5 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPct(history?.changePct)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({formatNav(history?.change)})
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Period Start NAV
                  </span>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                    {formatNav(history?.startNav)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Baseline benchmark
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {selectedRange} Range High / Low
                  </span>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                    {formatNav(history?.rangeHigh)} / {formatNav(history?.rangeLow)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Period extremes
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    52-Week High / Low
                  </span>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                    {formatNav(history?.high52w || fund.high52w)} / {formatNav(history?.low52w || fund.low52w)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Annual boundary
                  </span>
                </div>
              </div>

              {/* Interactive SVG Chart with crosshair scrub */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                {isLoading && !history ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    Ingesting time series points...
                  </div>
                ) : (
                  <InteractiveSvgChart
                    points={history?.points || []}
                    startNav={history?.startNav || fund.latestNav}
                    isPositive={isPositive}
                    height={280}
                  />
                )}
              </div>
            </div>
          )}

          {/* Tab 2: 4 Sub-Plans AAUM Aggregation */}
          {activeTab === 'aum_breakdown' && (
            <AumBreakdownTable
              subPlans={fund.subPlans}
              schemeAumCr={fund.schemeAumCr}
              schemeAumLakhs={fund.schemeAumLakhs}
              reportingDate={fund.aumReportingDate}
              categoryAumCr={fund.categoryAumCr}
              categoryName={fund.category}
            />
          )}

          {/* Strategy & Compliance Details */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Regulatory Classification</span>
              <p className="text-slate-200 font-medium">
                SEBI Specialised Investment Fund (SIF)
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Derivatives long-short & unconstrained asset allocation enabled
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Expense Ratio & Valuation</span>
              <p className="text-slate-200 font-mono font-medium">
                {fund.expenseRatio}% TER (Direct Plan)
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Daily NAV published post-close (9:00 PM – 11:30 PM IST)
              </p>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Inception & Liquidity</span>
              <p className="text-slate-200 font-medium">
                {formatAmfiDate(fund.inceptionDate)}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Open-ended mutual fund with T+1 / T+2 redemption cycle
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>AMFI Official Disclosure · Ingested via SIF360 Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
