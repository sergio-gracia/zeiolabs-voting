import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User, Clock, Check } from 'lucide-react';
import { getUserNickname, setUserNickname } from '../utils/device';
import { getCommentsForImage, addComment } from '../utils/cloudDb';

export default function CommentDrawer({ image, onClose, userVotedImageId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(getUserNickname() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  const isThisCategoryFavorite = userVotedImageId === image.id;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCommentsForImage(image.id).then((list) => {
      if (isMounted) {
        setComments(list || []);
        setLoading(false);
        setTimeout(() => commentInputRef.current?.focus(), 150);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [image.id]);

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

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `${diffMins} min`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;

      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      
      {/* Backdrop click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Drawer */}
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 h-[75vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Grab bar indicator */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base text-slate-900">Comentarios</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {comments.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isThisCategoryFavorite && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                <Check className="w-3 h-3" /> Votada por ti
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold">Cargando comentarios...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">Sin comentarios aún</p>
              <p className="text-[11px] text-slate-400">Sé el primero en dar tu opinión sobre esta opción.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id || c.timestamp} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {c.author ? c.author.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.author}</span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {formatTime(c.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-normal leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Form input */}
        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-slate-100 bg-white space-y-2">
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Tu apodo..."
              maxLength={25}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Añade un comentario..."
              maxLength={300}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="p-3 rounded-2xl bg-rose-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-600 transition active:scale-95 shadow-md shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
