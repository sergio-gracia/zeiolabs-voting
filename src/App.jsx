import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ReelCard from './components/ReelCard';
import CommentDrawer from './components/CommentDrawer';
import Leaderboard from './components/Leaderboard';
import OnboardingModal from './components/OnboardingModal';
import { getDeviceId, hasUserNickname } from './utils/device';
import { loadGalleryCategories } from './utils/imageLoader';
import { getGlobalVotes, castVote, getGlobalComments } from './utils/cloudDb';
import { RefreshCw, ImageOff } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedImageForComments, setSelectedImageForComments] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(!hasUserNickname());
  const deviceId = getDeviceId();

  const escapeKey = (key) => String(key).replace(/\//g, '__').replace(/\./g, '_');

  // Load and sync gallery data
  const syncData = useCallback(async () => {
    try {
      const rawCategories = loadGalleryCategories();

      const [votesMap, commentsMap] = await Promise.all([
        getGlobalVotes(),
        getGlobalComments()
      ]);

      const enrichedCategories = rawCategories.map((cat) => {
        let categoryVoteCount = 0;

        const enrichedImages = cat.images.map((img) => {
          const safeId = escapeKey(img.id);
          const imageVotes = votesMap[safeId] || {};
          const hasVoted = Boolean(imageVotes[deviceId]);
          const voteCount = Object.keys(imageVotes).length;

          if (hasVoted) categoryVoteCount++;

          const rawComments = commentsMap[safeId];
          const commentList = Array.isArray(rawComments)
            ? rawComments
            : rawComments && typeof rawComments === 'object'
            ? Object.values(rawComments)
            : [];

          return {
            ...img,
            voteCount,
            hasVoted,
            commentCount: commentList.length
          };
        });

        return {
          ...cat,
          userVotedCount: categoryVoteCount,
          images: enrichedImages
        };
      });

      setCategories(enrichedCategories);
    } catch (err) {
      console.error('Error syncing gallery:', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 4000);
    return () => clearInterval(interval);
  }, [syncData]);

  // Vote Handler: Allows voting as many images as desired!
  const handleVote = async (image) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.name !== image.category) return cat;

        const updatedImages = cat.images.map((img) => {
          if (img.id === image.id) {
            const isCurrentlyVoted = img.hasVoted;
            return {
              ...img,
              hasVoted: !isCurrentlyVoted,
              voteCount: isCurrentlyVoted ? Math.max(0, img.voteCount - 1) : img.voteCount + 1
            };
          }
          return img;
        });

        return {
          ...cat,
          images: updatedImages
        };
      })
    );

    await castVote(image.category, image.id, deviceId);
    syncData();
  };

  const getDisplayImages = () => {
    if (activeTab === 'ALL') {
      return categories.flatMap((cat) => cat.images);
    }
    const catObj = categories.find((c) => c.name === activeTab);
    return catObj ? catObj.images : [];
  };

  const displayImages = getDisplayImages();

  return (
    <div className="h-[100dvh] w-full bg-white text-slate-900 flex flex-col overflow-hidden relative">
      
      {/* Onboarding Popup Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Top Header */}
      <Header
        categories={categories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Reels Vertical Feed Container */}
      <main className="flex-1 w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-white no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center flex-col gap-3 bg-white">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-400">Cargando la galería...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-3 p-6 text-center bg-white">
            <ImageOff className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800">No hay imágenes</h3>
          </div>
        ) : activeTab === 'RANKING' ? (
          <Leaderboard onOpenModal={(img) => setSelectedImageForComments(img)} />
        ) : displayImages.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 p-6 text-center bg-white">
            <p className="text-xs font-bold text-slate-400">No hay imágenes en esta categoría</p>
          </div>
        ) : (
          displayImages.map((image) => (
            <ReelCard
              key={image.id}
              image={image}
              onVote={handleVote}
              onOpenComments={(img) => setSelectedImageForComments(img)}
            />
          ))
        )}
      </main>

      {/* Bottom Sheet Comment Drawer */}
      {selectedImageForComments && (
        <CommentDrawer
          image={selectedImageForComments}
          onClose={() => {
            setSelectedImageForComments(null);
            syncData();
          }}
        />
      )}

    </div>
  );
}
