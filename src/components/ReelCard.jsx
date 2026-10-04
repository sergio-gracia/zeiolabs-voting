import React, { useState } from 'react';
import { Heart, MessageSquare, Check, Sparkles, Folder } from 'lucide-react';

export default function ReelCard({ image, onVote, onOpenComments, userVotedImageId }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const isVoted = image.hasVoted;
  const isThisCategoryFavorite = userVotedImageId === image.id;

  // Double click / tap to like
  const handleImageDoubleClick = () => {
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
    if (!isVoted) {
      onVote(image);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200">
      
      {/* Background blur container for extra visual appeal */}
      {imageLoaded && (
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none scale-110 filter blur-3xl">
          <img src={image.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Main Image Container */}
      <div 
        onDoubleClick={handleImageDoubleClick}
        className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 select-none cursor-pointer"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
            <span className="text-xs text-slate-400 font-semibold animate-pulse">Cargando imagen...</span>
          </div>
        )}

        <img
          src={image.url}
          alt={image.filename}
          onLoad={() => setImageLoaded(true)}
          className={`max-h-full max-w-full object-contain rounded-2xl shadow-xl transition-all duration-300 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          loading="lazy"
        />

        {/* Double-tap big heart animation overlay */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-ping" />
          </div>
        )}
      </div>

      {/* Bottom Gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Bottom Info Overlay (Left) */}
      <div className="absolute bottom-6 left-4 right-20 z-20 space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-900 backdrop-blur-md shadow-md flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-rose-500" />
            {image.category}
          </span>

          {isThisCategoryFavorite && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tu Voto en {image.category}
            </span>
          )}
        </div>

        <p className="text-sm font-bold text-white tracking-wide truncate drop-shadow-md">
          {image.filename}
        </p>
      </div>

      {/* Right Action Bar (Instagram Reels Style) */}
      <div className="absolute bottom-8 right-4 z-20 flex flex-col items-center gap-5 pointer-events-auto">
        
        {/* Vote / Like Button */}
        <button
          onClick={() => onVote(image)}
          className="group flex flex-col items-center gap-1 focus:outline-none"
        >
          <div className={`p-3 rounded-full transition-all duration-200 active:scale-75 shadow-lg backdrop-blur-md ${
            isVoted
              ? 'bg-rose-500 text-white shadow-rose-500/40 scale-110'
              : 'bg-white/90 text-slate-800 hover:text-rose-500 hover:bg-white'
          }`}>
            <Heart className={`w-6 h-6 transition-transform ${isVoted ? 'fill-white' : ''}`} />
          </div>
          <span className="text-xs font-black text-white drop-shadow-md">
            {image.voteCount}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => onOpenComments(image)}
          className="group flex flex-col items-center gap-1 focus:outline-none"
        >
          <div className="p-3 rounded-full bg-white/90 text-slate-800 hover:text-indigo-600 hover:bg-white shadow-lg backdrop-blur-md transition-all active:scale-75">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-white drop-shadow-md">
            {image.commentCount}
          </span>
        </button>

      </div>

    </div>
  );
}
