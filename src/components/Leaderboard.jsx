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
          let categoryTotalVotes = 0;

          const rankedImages = cat.images
            .map((img) => {
              const safeId = escapeKey(img.id);
              const imageVotes = votesMap[safeId] || {};
              const voteCount = Object.keys(imageVotes).length;
              categoryTotalVotes += voteCount;

              const rawComments = commentsMap[safeId];
              const commentList = Array.isArray(rawComments)
                ? rawComments
                : rawComments && typeof rawComments === 'object'
                ? Object.values(rawComments)
                : [];

              return {
                ...img,
                voteCount,
                commentCount: commentList.length
              };
            })
            .sort((a, b) => b.voteCount - a.voteCount);

          return {
            category: cat.name,
            totalVotes: categoryTotalVotes,
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
      <div className="py-24 text-center space-y-3 bg-white">
        <Trophy className="w-10 h-10 text-amber-500 animate-bounce mx-auto" />
        <p className="text-xs font-bold text-slate-500">Calculando clasificación...</p>
      </div>
    );
  }

  const categoriesList = data.map((d) => d.category);

  return (
    <div className="pt-24 pb-16 px-4 max-w-md mx-auto space-y-6 bg-white min-h-screen">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 text-center space-y-2 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black tracking-tight">Tabla de Clasificación</h2>
        <p className="text-xs text-slate-400 font-medium">
          Las imágenes más votadas por tus amigos en tiempo real.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas
        </button>

        {categoriesList.map((catName) => (
          <button
            key={catName}
            onClick={() => setSelectedCategory(catName)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
              selectedCategory === catName
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          const maxVotes = catGroup.topImages[0]?.voteCount || 1;

          return (
            <div key={catGroup.category} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              
              {/* Category Subheader */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  {catGroup.category}
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {catGroup.totalVotes} votos totales
                </span>
              </div>

              {/* Items ranking */}
              <div className="space-y-3">
                {catGroup.topImages.map((img, index) => {
                  const votePercentage = Math.round((img.voteCount / (maxVotes || 1)) * 100);

                  let rankBadge = (
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                  );

                  if (index === 0) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                        🥇
                      </span>
                    );
                  } else if (index === 1) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-sm">
                        🥈
                      </span>
                    );
                  } else if (index === 2) {
                    rankBadge = (
                      <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                        🥉
                      </span>
                    );
                  }

                  return (
                    <div
                      key={img.id}
                      onClick={() => onOpenModal(img)}
                      className="group flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 cursor-pointer transition"
                    >
                      <div className="shrink-0">{rankBadge}</div>

                      <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 relative">
                        <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{img.filename}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 fill-rose-500" /> {img.voteCount}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> {img.commentCount}
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0
                                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600'
                                : 'bg-indigo-600'
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
