import React, { useState } from 'react';
import { Heart, MessageSquare, Maximize2, Check } from 'lucide-react';

export default function ImageCard({ image, onVote, onOpenModal, userVotedImageId }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isVoted = image.hasVoted;
  const isCategoryVoted = Boolean(userVotedImageId);
  const isThisCategoryFavorite = userVotedImageId === image.id;

  return (
    <div className="group relative bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-2xl flex flex-col">
      
      {/* Image Container */}
      <div 
        onClick={() => onOpenModal(image)}
        className="relative aspect-square w-full bg-slate-950 overflow-hidden cursor-pointer select-none"
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-600">Cargando...</span>
          </div>
        )}

        <img
          src={image.url}
          alt={image.filename}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 opacity-90 group-hover:opacity-100 transition-opacity" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
            {image.category}
          </span>
          {isThisCategoryFavorite && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-md shadow-rose-500/30 animate-in fade-in">
              <Check className="w-3 h-3" /> Tu Voto
            </span>
          )}
        </div>

        {/* Zoom button badge */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-900">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Votes count overlay at bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-xs font-bold text-rose-400">
            <Heart className={`w-3.5 h-3.5 ${image.voteCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{image.voteCount}</span>
          </div>
        </div>
      </div>

      {/* Card Footer / Actions */}
      <div className="p-3.5 bg-slate-900 flex items-center justify-between gap-2 border-t border-slate-800/60 mt-auto">
        
        {/* Comment button */}
        <button
          onClick={() => onOpenModal(image, true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition active:scale-95 border border-slate-700/50"
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span>{image.commentCount > 0 ? image.commentCount : 'Comentar'}</span>
        </button>

        {/* Vote Button */}
        <button
          onClick={() => onVote(image)}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
            isVoted
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500'
              : isCategoryVoted
              ? 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 border border-slate-700/60'
              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform duration-200 ${isVoted ? 'fill-white scale-110' : ''}`} />
          <span>{isVoted ? 'Votado' : 'Votar'}</span>
        </button>

      </div>
    </div>
  );
}
