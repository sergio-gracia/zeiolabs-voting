import React, { useState } from 'react';
import { Flame, User, Sparkles, Check } from 'lucide-react';
import { getUserNickname, setUserNickname } from '../utils/device';

export default function Header({ totalVotedCategories = 0, totalCategories = 0 }) {
  const [showNameModal, setShowNameModal] = useState(false);
  const [nickname, setNickname] = useState(getUserNickname());

  const handleSaveNickname = (e) => {
    e.preventDefault();
    setUserNickname(nickname);
    setShowNameModal(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-md shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
              ZeioVote <Sparkles className="w-4 h-4 text-amber-400 inline" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Vota tus imágenes favoritas</p>
          </div>
        </div>

        {/* User Nickname & Vote status badge */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-300">
            <span>Votos:</span>
            <span className="text-amber-400">{totalVotedCategories}/{totalCategories}</span>
          </div>

          {/* User Nickname Button */}
          <button
            onClick={() => setShowNameModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[100px] truncate">
              {getUserNickname() || 'Tu Nombre'}
            </span>
          </button>
        </div>
      </div>

      {/* Modal to change nickname */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Tu Apodo / Nombre</h3>
            <p className="text-xs text-slate-400 mb-4">
              Este nombre aparecerá cuando comentes en las imágenes.
            </p>

            <form onSubmit={handleSaveNickname} className="space-y-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. Carlos, Laura..."
                maxLength={30}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
