import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, MessageSquare, User, Clock, Check } from 'lucide-react';
import { getUserNickname, setUserNickname } from '../utils/device';
import { getCommentsForImage, addComment } from '../utils/cloudDb';

export default function ImageModal({ image, onClose, onVote, userVotedImageId, focusComment = false }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(getUserNickname() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  const isVoted = image.hasVoted;
  const isThisCategoryFavorite = userVotedImageId === image.id;

  // Fetch comments for this image
  useEffect(() => {
    let isMounted = true;
    setLoadingComments(true);

    getCommentsForImage(image.id).then((list) => {
      if (isMounted) {
        setComments(list || []);
        setLoadingComments(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [image.id]);

  // Focus comment input if requested
  useEffect(() => {
    if (focusComment && commentInputRef.current) {
      setTimeout(() => commentInputRef.current?.focus(), 150);
    }
  }, [focusComment]);

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const finalAuthor = authorName.trim() || 'Amigo Anónimo';
    setUserNickname(finalAuthor);

    try {
      const updatedList = await addComment(image.id, finalAuthor, newComment.trim());
      setComments(updatedList);
      setNewComment('');
      image.commentCount = updatedList.length;
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timestamp helper
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours}h`;

      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200">
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 transition active:scale-95 shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Image View Area */}
      <div className="flex-1 relative bg-black/60 flex items-center justify-center p-4 overflow-hidden min-h-[40vh] md:min-h-full">
        <img
          src={image.url}
          alt={image.filename}
          className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none"
        />

        {/* Floating action bar on top of image for mobile */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-300 pointer-events-auto">
            Categoría: <span className="text-indigo-400">{image.category}</span>
          </div>

          <button
            onClick={() => onVote(image)}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-lg backdrop-blur-md active:scale-95 ${
              isVoted
                ? 'bg-rose-600 text-white shadow-rose-600/40'
                : 'bg-slate-900/90 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isVoted ? 'fill-white' : ''}`} />
            <span>{isVoted ? 'Tu favorita' : `Votar (${image.voteCount})`}</span>
          </button>
        </div>
      </div>

      {/* Comments Panel */}
      <div className="w-full md:w-[380px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800/80 flex flex-col h-[50vh] md:h-full">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-100">Comentarios</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 font-medium">
              {comments.length}
            </span>
          </div>

          {isThisCategoryFavorite && (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3" /> Votada por ti
            </span>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingComments ? (
            <div className="text-center py-8 text-xs text-slate-500">Cargando comentarios...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Aún no hay comentarios.</p>
              <p className="text-[11px] text-slate-500">¡Sé el primero en dar tu opinión sobre esta imagen!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id || c.timestamp} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" /> {c.author}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {formatTime(c.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">{c.text}</p>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handleCommentSubmit} className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              maxLength={25}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={300}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="p-2.5 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition active:scale-95 shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
