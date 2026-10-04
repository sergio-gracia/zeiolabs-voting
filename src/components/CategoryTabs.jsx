import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

export default function CategoryTabs({ categories, activeTab, onTabChange }) {
  return (
    <div className="sticky top-[61px] z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-2.5 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-4xl mx-auto flex items-center gap-2 min-w-max">
        
        {/* Category Tabs */}
        {categories.map((cat) => {
          const isActive = activeTab === cat.name;
          const hasVoted = Boolean(cat.userVotedImageId);

          return (
            <button
              key={cat.name}
              onClick={() => onTabChange(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {cat.images.length}
              </span>

              {hasVoted && (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-400'}`} />
              )}
            </button>
          );
        })}

        {/* Separator line */}
        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        {/* Ranking / Leaderboard Tab */}
        <button
          onClick={() => onTabChange('RANKING')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
            activeTab === 'RANKING'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Ranking Top</span>
        </button>

      </div>
    </div>
  );
}
