import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import { Fund } from '../types/fund.ts';
import { formatAumCr, formatNav, formatPct } from '../utils/formatters.ts';

interface FundSearchProps {
  funds: Fund[];
  onSelectFund: (fund: Fund) => void;
  selectedCategory?: string;
  selectedAmc?: string;
}

export const FundSearch: React.FC<FundSearchProps> = ({
  funds,
  onSelectFund,
  selectedCategory,
  selectedAmc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter and strictly limit to 5 matches
  const filteredFunds = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const q = searchTerm.toLowerCase().trim();

    const matches = funds.filter((f) => {
      // Optional category / AMC constraints if active
      if (selectedCategory && selectedCategory !== 'ALL' && f.category !== selectedCategory) {
        return false;
      }
      if (selectedAmc && selectedAmc !== 'ALL' && f.amcCode !== selectedAmc) {
        return false;
      }

      return (
        f.name.toLowerCase().includes(q) ||
        f.shortName.toLowerCase().includes(q) ||
        f.amc.toLowerCase().includes(q) ||
        f.code.includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });

    // STRICT LIMIT: exactly 5 matches as specified in requirements
    return matches.slice(0, 5);
  }, [searchTerm, funds, selectedCategory, selectedAmc]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredFunds.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredFunds.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredFunds.length) % filteredFunds.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFunds[selectedIndex]) {
        handleSelect(filteredFunds[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (fund: Fund) => {
    onSelectFund(fund);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => {
            if (searchTerm.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search 15+ Indian SIF strategies, AMCs, or codes..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-suggest dropdown - strictly capped at 5 items */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden divide-y divide-slate-800/60 backdrop-blur-xl">
          <div className="px-3.5 py-2 bg-slate-950/60 flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <span>Direct Autocomplete ({filteredFunds.length} of 5 max)</span>
            <span className="text-[10px] text-slate-400">↑↓ to navigate · ↵ to select</span>
          </div>

          {filteredFunds.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No Indian SIF matching &ldquo;{searchTerm}&rdquo; found.
            </div>
          ) : (
            filteredFunds.map((fund, idx) => {
              const isSelected = idx === selectedIndex;
              const hasAum = fund.aumDisclosed && fund.schemeAumCr;
              return (
                <button
                  key={fund.code}
                  onClick={() => handleSelect(fund)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-3 transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-indigo-950/50 text-white' : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* AMC Avatar Badge */}
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: fund.amcBrandColor || '#4f46e5' }}
                    >
                      {fund.amcAvatarText}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                        <span className="font-medium text-slate-300">{fund.amc}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-slate-400">#{fund.code}</span>
                      </div>
                      <div className="text-sm font-semibold truncate text-slate-100">
                        {fund.shortName}
                      </div>
                      <div className="text-[11px] text-indigo-400/90 font-medium">
                        {fund.category}
                      </div>
                    </div>
                  </div>

                  {/* Right side: ₹ Cr AUM badge + NAV */}
                  <div className="shrink-0 text-right flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      {hasAum ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                          {formatAumCr(fund.schemeAumCr)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/40">
                          Pending disclosure
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1">
                      <span>NAV: {formatNav(fund.latestNav)}</span>
                      <span className={fund.navChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ({formatPct(fund.navChangePct)})
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
