import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Layers,
  TrendingUp,
  ShieldAlert,
  Building,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  PieChart,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Fund, AmcFamily, SifCategory } from './types/fund.ts';
import { formatAumCr, formatINR } from './utils/formatters.ts';
import { Header } from './components/Header.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { FundCard } from './components/FundCard.tsx';
import { FundModal } from './components/FundModal.tsx';
import { SyncModal } from './components/SyncModal.tsx';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAmc, setSelectedAmc] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'aum_desc' | 'change_desc' | 'name' | 'nav_desc'>('aum_desc');
  const [selectedFundForModal, setSelectedFundForModal] = useState<Fund | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Fetch all funds via SWR
  const { data, error, mutate, isLoading } = useSWR<{ success: boolean; count: number; funds: Fund[] }>(
    '/api/funds',
    fetcher,
    { revalidateOnFocus: true }
  );

  const allFunds: Fund[] = data?.funds || [];

  // Group variants by AMC/Family
  const amcFamilies: AmcFamily[] = useMemo(() => {
    const familyMap = new Map<string, Fund[]>();

    for (const fund of allFunds) {
      const existing = familyMap.get(fund.amcCode) || [];
      existing.push(fund);
      familyMap.set(fund.amcCode, existing);
    }

    const families: AmcFamily[] = [];
    for (const [amcCode, funds] of familyMap.entries()) {
      const first = funds[0];
      const totalAmcAumCr = funds.reduce((acc, f) => acc + (f.schemeAumCr || 0), 0);
      families.push({
        amc: first.amc,
        amcCode,
        amcAvatarText: first.amcAvatarText,
        amcBrandColor: first.amcBrandColor,
        funds,
        totalAmcAumCr,
      });
    }

    return families;
  }, [allFunds]);

  // Overall SIF Industry Metrics
  const industryMetrics = useMemo(() => {
    let totalAumCr = 0;
    const categoryTotals: Record<string, number> = {};

    for (const f of allFunds) {
      if (f.schemeAumCr) {
        totalAumCr += f.schemeAumCr;
        categoryTotals[f.category] = (categoryTotals[f.category] || 0) + f.schemeAumCr;
      }
    }

    return {
      totalAumCr: Number(totalAumCr.toFixed(2)),
      activeSchemesCount: allFunds.length,
      amcCount: amcFamilies.length,
      categoryTotals,
    };
  }, [allFunds, amcFamilies]);

  // Filter and sort AMC families
  const filteredFamilies = useMemo(() => {
    let filtered = amcFamilies.filter((family) => {
      // AMC Filter
      if (selectedAmc !== 'ALL' && family.amcCode !== selectedAmc) {
        return false;
      }

      // Category Filter (keep family if at least one strategy matches)
      if (selectedCategory !== 'ALL') {
        const hasMatchingStrategy = family.funds.some((f) => f.category === selectedCategory);
        if (!hasMatchingStrategy) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'aum_desc') {
        return b.totalAmcAumCr - a.totalAmcAumCr;
      }
      if (sortBy === 'name') {
        return a.amc.localeCompare(b.amc);
      }
      if (sortBy === 'change_desc') {
        const aMaxChange = Math.max(...a.funds.map((f) => f.navChangePct));
        const bMaxChange = Math.max(...b.funds.map((f) => f.navChangePct));
        return bMaxChange - aMaxChange;
      }
      if (sortBy === 'nav_desc') {
        const aMaxNav = Math.max(...a.funds.map((f) => f.latestNav));
        const bMaxNav = Math.max(...b.funds.map((f) => f.latestNav));
        return bMaxNav - aMaxNav;
      }
      return 0;
    });

    return filtered;
  }, [amcFamilies, selectedCategory, selectedAmc, sortBy]);

  // Category Filter Options
  const categoryOptions = useMemo(() => {
    const list: { label: string; value: string; count: number; aumCr: number }[] = [
      {
        label: 'All SIF Strategies',
        value: 'ALL',
        count: allFunds.length,
        aumCr: industryMetrics.totalAumCr,
      },
    ];

    const categories: SifCategory[] = [
      'Equity Long-Short',
      'Active Asset Allocator',
      'Equity Ex-Top 100 Long-Short',
      'Sector Rotation',
      'Hybrid Long-Short',
    ];

    for (const cat of categories) {
      const matching = allFunds.filter((f) => f.category === cat);
      const sumAum = matching.reduce((acc, f) => acc + (f.schemeAumCr || 0), 0);
      list.push({
        label: cat,
        value: cat,
        count: matching.length,
        aumCr: Number(sumAum.toFixed(2)),
      });
    }

    return list;
  }, [allFunds, industryMetrics.totalAumCr]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Header with typeahead search, AMFI status, and database badge */}
      <Header
        funds={allFunds}
        onSelectFund={(fund) => setSelectedFundForModal(fund)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        selectedCategory={selectedCategory}
        selectedAmc={selectedAmc}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
        {/* Industry Headline & Overview Card */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SEBI SIF FRAMEWORK · LIVE AMFI TRACKING</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Indian Specialised Investment Funds Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Comprehensive tracking engine for high-ticket alternative mutual funds with a{' '}
                <strong className="text-slate-200">₹10 Lakh+ minimum ticket</strong>. Tracking daily
                post-market AMFI NAVs and aggregating quarterly AAUM disclosures across 4 sub-plans
                (Direct/Regular &times; Growth/IDCW).
              </p>
            </div>

            {/* Quick SIF Metric Badges */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0 divide-x divide-slate-800/80">
              <div className="pr-4 sm:pr-6">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Industry AAUM
                </span>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">
                  {formatAumCr(industryMetrics.totalAumCr)}
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Aggregated from AMFI
                </span>
              </div>

              <div className="pl-4 sm:pl-6">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Indexed Strategies
                </span>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">
                  {industryMetrics.activeSchemesCount}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {industryMetrics.amcCount} AMC Families
                </span>
              </div>
            </div>
          </div>

          {/* Strategy Distribution Breakdown Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {categoryOptions
              .filter((c) => c.value !== 'ALL')
              .map((cat) => (
                <div
                  key={cat.value}
                  className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <div className="text-[11px] text-slate-400 truncate mb-0.5">{cat.label}</div>
                  <div className="font-mono font-semibold text-slate-200">
                    {formatAumCr(cat.aumCr)}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                    {cat.count} {cat.count === 1 ? 'Scheme' : 'Schemes'}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Filters & Sorting Control Bar (Zero-Pill Discipline) */}
        <section className="space-y-4">
          {/* Category Tabs */}
          <CategoryFilter
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Secondary Controls: AMC Dropdown & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter AMC Family:</span>
              </span>

              <select
                value={selectedAmc}
                onChange={(e) => setSelectedAmc(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500 font-sans cursor-pointer hover:border-slate-700"
              >
                <option value="ALL">All AMCs ({amcFamilies.length})</option>
                {amcFamilies.map((fam) => (
                  <option key={fam.amcCode} value={fam.amcCode}>
                    {fam.amc} ({fam.funds.length} funds)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort By:</span>
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500 font-sans cursor-pointer hover:border-slate-700"
              >
                <option value="aum_desc">Highest Scheme AAUM (₹ Cr)</option>
                <option value="change_desc">Highest 1D % Return</option>
                <option value="nav_desc">Highest NAV</option>
                <option value="name">AMC Name (A-Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* AMC Strategy Cards Grid */}
        <section>
          {isLoading && amcFamilies.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Ingesting Specialised Investment Fund records...</p>
            </div>
          ) : filteredFamilies.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8">
              <p className="text-base font-semibold text-slate-200">No matching SIF families found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting &ldquo;All SIF Strategies&rdquo; or clearing your AMC filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedAmc('ALL');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFamilies.map((family) => (
                <FundCard
                  key={family.amcCode}
                  amcFamily={family}
                  onOpenModal={(fund) => setSelectedFundForModal(fund)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Explanatory Regulatory Footer Note */}
        <footer className="pt-8 pb-12 border-t border-slate-800/60 text-xs text-slate-400 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">SIF360 Intelligence Engine</span>
              <span>·</span>
              <span>Indian Specialised Investment Funds Analytics</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              AMFI Window: 9:00 PM – 11:30 PM IST · Neon PostgreSQL Architecture
            </div>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            <strong>Regulatory Disclaimer:</strong> Specialised Investment Funds (SIFs) represent an
            alternative mutual fund category established by the Securities and Exchange Board of India
            (SEBI) requiring a mandatory minimum commitment of ₹10,00,000. These funds utilize derivative
            long-short positions, active asset allocation, sector rotation, and inverse equity strategies.
            All NAV figures are retrieved from official AMFI disclosures. AAUM figures represent the
            aggregated quarterly average across all 4 sub-plans (Direct/Regular &times; Growth/IDCW).
          </p>
        </footer>
      </main>

      {/* Fund Modal Deep Dive */}
      {selectedFundForModal && (
        <FundModal
          fund={selectedFundForModal}
          onClose={() => setSelectedFundForModal(null)}
        />
      )}

      {/* Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSynced={() => {
          mutate(); // revalidate SWR
        }}
      />
    </div>
  );
}
