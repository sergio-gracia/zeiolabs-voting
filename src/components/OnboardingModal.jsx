import React, { useState } from 'react';
import { Sparkles, ArrowRight, Instagram } from 'lucide-react';
import { setUserNickname } from '../utils/device';

export default function OnboardingModal({ onComplete }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, escribe tu nombre para continuar.');
      return;
    }
    setUserNickname(name);
    onComplete(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Instagram style badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-xl shadow-rose-500/20">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Instagram className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            ¡Bienvenido/a! <Sparkles className="w-5 h-5 text-amber-500 inline" />
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Introduce tu apodo o nombre para empezar a votar y comentar tus imágenes favoritas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-center"
            />
            {error && <p className="text-[11px] font-semibold text-rose-500 mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition active:scale-95"
          >
            <span>Empezar a Votar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-slate-400">
          Tus votos y comentarios se guardarán de forma segura.
        </p>

      </div>
    </div>
  );
}
