import React from 'react';
import { Layers, RefreshCw, Clock, ShieldCheck, Search, Activity } from 'lucide-react';
import { Fund } from '../types/fund.ts';
import { FundSearch } from './FundSearch.tsx';
import { DatabaseStatusBadge } from './DatabaseStatusBadge.tsx';

interface HeaderProps {
  funds: Fund[];
  onSelectFund: (fund: Fund) => void;
  onOpenSyncModal: () => void;
  selectedCategory: string;
  selectedAmc: string;
}

export const Header: React.FC<HeaderProps> = ({
  funds,
  onSelectFund,
  onOpenSyncModal,
  selectedCategory,
  selectedAmc,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & SIF Subtitle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight font-sans">
                  SIF<span className="text-indigo-400">360</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40 uppercase tracking-wider font-semibold">
                  SEBI ₹10L+
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Indian Specialised Investment Funds Analytics
              </p>
            </div>
          </div>

          {/* Quick sync button for mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenSyncModal}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
              title="Open AMFI Sync"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Real-time debounced typeahead autocomplete search bar (limit 5) */}
        <div className="w-full md:max-w-md">
          <FundSearch
            funds={funds}
            onSelectFund={onSelectFund}
            selectedCategory={selectedCategory}
            selectedAmc={selectedAmc}
          />
        </div>

        {/* Right Actions: AMFI Window indicator, Sync button, and DB status */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* AMFI Post-market window badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-slate-900/60 border border-slate-800/60 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>AMFI Window: 9:00 PM – 11:30 PM IST</span>
          </div>

          <DatabaseStatusBadge />

          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>AMFI Pipelines</span>
          </button>
        </div>
      </div>
    </header>
  );
};
