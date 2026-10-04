import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { setUserNickname } from '../utils/device';

export default function OnboardingModal({ onComplete }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, escribe tu nombre o apodo para continuar.');
      return;
    }
    setUserNickname(name);
    onComplete(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* User Check Badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <UserCheck className="w-7 h-7" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            ¡Bienvenido/a! <Sparkles className="w-5 h-5 text-amber-500 inline" />
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Introduce tu apodo para votar y comentar las imágenes.
          </p>
        </div>

        {/* Login Explanation Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¿Cómo funciona el acceso?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            No necesitas contraseña ni registro. Se asignará un <strong>1 voto por dispositivo</strong> vinculado a tu apodo.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="¿Cómo te llamas?"
              maxLength={25}
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all text-center"
            />
            {error && <p className="text-[11px] font-semibold text-rose-500 mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition active:scale-95"
          >
            <span>Entrar a Votar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
