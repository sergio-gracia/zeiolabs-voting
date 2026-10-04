import React, { useState } from 'react';
import { Sparkles, User, Trophy, Flame, CheckCircle2 } from 'lucide-react';
import { getUserNickname, setUserNickname } from '../utils/device';

export default function Header({
  categories = [],
  activeTab = '',
  onTabChange,
  totalVotedCategories = 0
}) {
  const [showNameModal, setShowNameModal] = useState(false);
  const [nickname, setNickname] = useState(getUserNickname());

  const handleSaveNickname = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      setUserNickname(nickname.trim());
      setShowNameModal(false);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      
      {/* Main Top Bar */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        
        {/* Logo ZeioVote */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1">
            ZeioVote <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />
          </span>
        </div>

        {/* User Nickname Button */}
        <button
          onClick={() => {
            setNickname(getUserNickname());
            setShowNameModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 hover:bg-slate-200 transition active:scale-95 shadow-2xs"
        >
          <User className="w-3.5 h-3.5 text-indigo-600" />
          <span className="max-w-[90px] truncate">{getUserNickname() || 'Tu Apodo'}</span>
        </button>

      </div>

      {/* Category Pills Bar */}
      <div className="max-w-md mx-auto px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        
        {/* All Tab */}
        <button
          onClick={() => onTabChange('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 active:scale-95 shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
          }`}
        >
          Todas
        </button>

        {/* Category Pills */}
        {categories.map((cat) => {
          const isActive = activeTab === cat.name;
          const hasVoted = Boolean(cat.userVotedImageId);

          return (
            <button
              key={cat.name}
              onClick={() => onTabChange(cat.name)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <span>{cat.name}</span>
              {hasVoted && (
                <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
              )}
            </button>
          );
        })}

        {/* Ranking Tab */}
        <button
          onClick={() => onTabChange('RANKING')}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 active:scale-95 shrink-0 ${
            activeTab === 'RANKING'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-amber-50 text-amber-600 border border-amber-200/80'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Ranking</span>
        </button>

      </div>

      {/* Edit Nickname Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Cambiar tu Apodo</h3>
            <form onSubmit={handleSaveNickname} className="space-y-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Tu apodo..."
                maxLength={25}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
