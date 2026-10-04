import React, { useState, useEffect } from 'react';
import { Trophy, Heart, MessageSquare, Flame } from 'lucide-react';
import { loadGalleryCategories } from '../utils/imageLoader';
import { getGlobalVotes, getGlobalComments } from '../utils/cloudDb';

export default function Leaderboard({ onOpenModal }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const escapeKey = (key) => String(key).replace(/\//g, '__').replace(/\./g, '_');

  useEffect(() => {
    async function loadRanking() {
      try {
        const rawCategories = loadGalleryCategories();
        const [votesMap, commentsMap] = await Promise.all([
          getGlobalVotes(),
          getGlobalComments()
        ]);

        const leaderboard = rawCategories.map((cat) => {
          const categoryVotes = votesMap[cat.name] || {};
          const voteCounts = {};

          Object.values(categoryVotes).forEach((votedId) => {
            voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
          });

          const rankedImages = cat.images
            .map((img) => {
              const safeId = escapeKey(img.id);
              const rawComments = commentsMap[safeId];
              const commentList = Array.isArray(rawComments)
                ? rawComments
                : rawComments && typeof rawComments === 'object'
                ? Object.values(rawComments)
                : [];

              return {
                ...img,
                voteCount: voteCounts[img.id] || 0,
                commentCount: commentList.length
              };
            })
            .sort((a, b) => b.voteCount - a.voteCount);

          return {
            category: cat.name,
            totalVotes: Object.keys(categoryVotes).length,
            topImages: rankedImages
          };
        });

        setData(leaderboard);
      } catch (err) {
        console.error('Error calculating leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Trophy className="w-10 h-10 text-amber-500 animate-bounce mx-auto opacity-80" />
        <p className="text-sm font-medium text-slate-400">Calculando los votos y posiciones...</p>
      </div>
    );
  }

  const categoriesList = data.map((d) => d.category);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-indigo-600/20 border border-amber-500/30 p-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1 shadow-lg shadow-amber-500/10">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Tabla de Clasificación</h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Descubre las imágenes favoritas más votadas por tus amigos en tiempo real.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Todas las Categorías
        </button>

        {categoriesList.map((catName) => (
          <button
            key={catName}
            onClick={() => setSelectedCategory(catName)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === catName
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {catName}
          </button>
        ))}
      </div>

      {/* Ranking Lists */}
      {data
        .filter((catGroup) => selectedCategory === 'ALL' || catGroup.category === selectedCategory)
        .map((catGroup) => {
          const totalCategoryVotes = catGroup.totalVotes || 1;

          return (
            <div key={catGroup.category} className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-5 space-y-4">
              
              {/* Category Subheader */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  {catGroup.category}
                </h3>
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Total votos: {catGroup.totalVotes}
                </span>
              </div>

              {/* Items ranking */}
              <div className="space-y-3">
                {catGroup.topImages.map((img, index) => {
                  const votePercentage = Math.round((img.voteCount / (totalCategoryVotes || 1)) * 100);

                  let rankBadge = (
                    <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                  );

                  if (index === 0) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30">
                        🥇
                      </span>
                    );
                  } else if (index === 1) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-slate-300/30">
                        🥈
                      </span>
                    );
                  } else if (index === 2) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-700/30">
                        🥉
                      </span>
                    );
                  }

                  return (
                    <div
                      key={img.id}
                      onClick={() => onOpenModal(img)}
                      className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition"
                    >
                      {/* Rank icon */}
                      <div className="shrink-0">{rankBadge}</div>

                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 relative">
                        <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>

                      {/* Info & Progress bar */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">{img.filename}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 fill-rose-500" /> {img.voteCount}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> {img.commentCount}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${votePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}

    </div>
  );
}
