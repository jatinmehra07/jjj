import React from 'react';
import { SifCategory } from '../types/fund.ts';

interface CategoryFilterProps {
  categories: { label: string; value: string; count: number; aumCr: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="border-b border-slate-800/80 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 min-w-max pb-px">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`px-3.5 py-2.5 text-xs font-medium transition-all relative cursor-pointer border-b-2 flex items-center gap-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-indigo-950/80 text-indigo-300' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
