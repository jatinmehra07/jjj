import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet, Clock, ArrowRight, Database, X } from 'lucide-react';
import { SyncNavResult, SyncAumResult } from '../types/fund.ts';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSynced: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, onSynced }) => {
  const [navSyncing, setNavSyncing] = useState(false);
  const [aumSyncing, setAumSyncing] = useState(false);
  const [navResult, setNavResult] = useState<SyncNavResult | null>(null);
  const [aumResult, setAumResult] = useState<SyncAumResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNav = async () => {
    try {
      setNavSyncing(true);
      setError(null);
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: SyncNavResult = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sync failed');
      setNavResult(data);
      onSynced();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setNavSyncing(false);
    }
  };

  const handleSyncAum = async () => {
    try {
      setAumSyncing(true);
      setError(null);
      const res = await fetch('/api/sync-aum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: SyncAumResult = await res.json();
      if (!res.ok) throw new Error(data.message || 'AUM sync failed');
      setAumResult(data);
      onSynced();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAumSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-black/80">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              <span>AMFI Ingestion Pipelines & Data Sync</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated ingestion for NAV tracking and quarterly AAUM disclosure tables
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Pipeline 1: Daily NAV Ingestion */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Pipeline 1: Daily AMFI NAV Ingestion</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Trigger post-market close NAV updates. Stores historical points into{' '}
                  <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">nav_history</code>.
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-2">
                  Publish Window: 9:00 PM – 11:30 PM IST (Business Days)
                </div>
              </div>

              <button
                onClick={handleSyncNav}
                disabled={navSyncing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${navSyncing ? 'animate-spin' : ''}`} />
                <span>{navSyncing ? 'Ingesting...' : 'Run NAV Sync'}</span>
              </button>
            </div>

            {navResult && (
              <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-emerald-400 flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{navResult.message}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Updated {navResult.recordsProcessed} schemes &middot; Timestamp: {navResult.timestamp}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline 2: Quarterly AAUM Disclosures Aggregation */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  <span>Pipeline 2: Quarterly AAUM Aggregation</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Parses 4 sub-plans (Direct/Regular &times; Growth/IDCW) in ₹ Lakhs and persists aggregated
                  crores (<code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">aumCr = aumLakhs / 100</code>).
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-2">
                  Target Quarter: Q2 FY27 (Ended 30-Sep-2026)
                </div>
              </div>

              <button
                onClick={handleSyncAum}
                disabled={aumSyncing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <Database className={`w-3.5 h-3.5 ${aumSyncing ? 'animate-spin' : ''}`} />
                <span>{aumSyncing ? 'Aggregating...' : 'Ingest AAUM Disclosures'}</span>
              </button>
            </div>

            {aumResult && (
              <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-indigo-300 flex items-start gap-2 bg-indigo-950/20 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{aumResult.message}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Total SIF Industry AAUM: ₹{aumResult.totalIndustryAumCr.toLocaleString('en-IN')} Cr &middot; {aumResult.schemesAggregated} schemes aggregated
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
