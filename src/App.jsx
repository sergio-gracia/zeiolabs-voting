import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CategoryTabs from './components/CategoryTabs';
import ImageCard from './components/ImageCard';
import ImageModal from './components/ImageModal';
import Leaderboard from './components/Leaderboard';
import { getDeviceId } from './utils/device';
import { loadGalleryCategories } from './utils/imageLoader';
import { getGlobalVotes, castVote, getGlobalComments } from './utils/cloudDb';
import { RefreshCw, ImageOff } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [focusComment, setFocusComment] = useState(false);
  const deviceId = getDeviceId();

  // Helper to escape image ID keys
  const escapeKey = (key) => String(key).replace(/\//g, '__').replace(/\./g, '_');

  // Load categories and sync cloud votes + comments
  const syncData = useCallback(async () => {
    try {
      // 1. Load static images from folder structure
      const rawCategories = loadGalleryCategories();

      // 2. Fetch global cloud votes and comments
      const [votesMap, commentsMap] = await Promise.all([
        getGlobalVotes(),
        getGlobalComments()
      ]);

      // 3. Enrich images with votes and comments stats
      const enrichedCategories = rawCategories.map((cat) => {
        const categoryVotes = votesMap[cat.name] || {};
        const userVotedImageId = categoryVotes[deviceId] || null;

        // Calculate vote counts per image
        const voteCounts = {};
        Object.values(categoryVotes).forEach((votedId) => {
          voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
        });

        const enrichedImages = cat.images.map((img) => {
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
            hasVoted: userVotedImageId === img.id,
            commentCount: commentList.length
          };
        });

        return {
          ...cat,
          userVotedImageId,
          images: enrichedImages
        };
      });

      setCategories(enrichedCategories);

      if (enrichedCategories.length > 0 && (!activeTab || (!enrichedCategories.some(c => c.name === activeTab) && activeTab !== 'RANKING'))) {
        setActiveTab(enrichedCategories[0].name);
      }
    } catch (err) {
      console.error('Error synchronizing gallery:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, activeTab]);

  useEffect(() => {
    syncData();
    // Auto refresh every 5 seconds to get live votes/comments from friends
    const interval = setInterval(syncData, 5000);
    return () => clearInterval(interval);
  }, [syncData]);

  // Handle Vote Action
  const handleVote = async (image) => {
    // Optimistic UI Update
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.name !== image.category) return cat;

        const isCurrentlyVoted = image.hasVoted;
        const newVotedId = isCurrentlyVoted ? null : image.id;

        const updatedImages = cat.images.map((img) => {
          if (img.id === image.id) {
            return {
              ...img,
              hasVoted: !isCurrentlyVoted,
              voteCount: isCurrentlyVoted ? Math.max(0, img.voteCount - 1) : img.voteCount + 1
            };
          } else if (img.hasVoted) {
            return {
              ...img,
              hasVoted: false,
              voteCount: Math.max(0, img.voteCount - 1)
            };
          }
          return img;
        });

        return {
          ...cat,
          userVotedImageId: newVotedId,
          images: updatedImages
        };
      })
    );

    // Update selectedImage if open in modal
    if (selectedImage && selectedImage.id === image.id) {
      setSelectedImage((prev) => (prev ? {
        ...prev,
        hasVoted: !prev.hasVoted,
        voteCount: prev.hasVoted ? Math.max(0, prev.voteCount - 1) : prev.voteCount + 1
      } : null));
    }

    // Cast vote to cloud database
    await castVote(image.category, image.id, deviceId);
    syncData();
  };

  const handleOpenModal = (image, shouldFocusComment = false) => {
    setSelectedImage(image);
    setFocusComment(shouldFocusComment);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setFocusComment(false);
    syncData();
  };

  const activeCategoryObj = categories.find((c) => c.name === activeTab);
  const totalVotedCategories = categories.filter((c) => Boolean(c.userVotedImageId)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        totalVotedCategories={totalVotedCategories}
        totalCategories={categories.length}
      />

      {/* Category Tabs */}
      {!loading && categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Cargando las imágenes y votos en tiempo real...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
            <ImageOff className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No se encontraron imágenes</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Asegúrate de que la carpeta <code className="text-indigo-400 bg-slate-800 px-2 py-0.5 rounded">images/</code> contiene imágenes en subcarpetas.
            </p>
          </div>
        ) : activeTab === 'RANKING' ? (
          <Leaderboard onOpenModal={(img) => handleOpenModal(img)} />
        ) : activeCategoryObj ? (
          <div className="space-y-4">
            
            {/* Intro Bar */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  {activeCategoryObj.name}
                  <span className="text-xs font-semibold text-slate-400">({activeCategoryObj.images.length} imágenes)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeCategoryObj.userVotedImageId
                    ? '✓ Ya has emitido tu voto en esta categoría'
                    : 'Toca en Votar para elegir tu opción favorita'}
                </p>
              </div>

              {activeCategoryObj.userVotedImageId && (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                  1 Voto Emitido
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeCategoryObj.images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onVote={handleVote}
                  onOpenModal={handleOpenModal}
                  userVotedImageId={activeCategoryObj.userVotedImageId}
                />
              ))}
            </div>

          </div>
        ) : null}

      </main>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleCloseModal}
          onVote={handleVote}
          userVotedImageId={
            categories.find((c) => c.name === selectedImage.category)?.userVotedImageId
          }
          focusComment={focusComment}
        />
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
        ZeioVote • GitHub Pages Ready • Optimizada para dispositivos móviles
      </footer>

    </div>
  );
}
