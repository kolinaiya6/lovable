import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, MessageCircle, Heart, X } from 'lucide-react';

interface MatchModalProps {
  currentUser: UserProfile;
  matchedUser: UserProfile | null;
  onClose: () => void;
  onStartChat: (matchedUser: UserProfile) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  currentUser,
  matchedUser,
  onClose,
  onStartChat,
}) => {
  if (!matchedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#1E121E] via-[#14141B] to-[#0A0A0D] border border-[#FF758F]/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sparkle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#E63946]/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header celebration */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E63946]/20 border border-[#E63946]/40 text-[#FF758F] text-xs font-bold tracking-wider uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mutual Connection</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          It's a Match! 🎉
        </h2>

        <p className="text-slate-300 text-sm mb-6">
          You and <span className="font-semibold text-[#FF758F]">{matchedUser.name}</span> have both shown love. Ready to meet tonight?
        </p>

        {/* Dual Avatars with Heart Pulse */}
        <div className="relative flex items-center justify-center gap-4 my-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-xl">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute z-10 w-10 h-10 rounded-full bg-gradient-to-tr from-[#E63946] to-[#FF758F] flex items-center justify-center shadow-lg shadow-[#E63946]/50 animate-bounce">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>

          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#FF758F] shadow-xl">
            <img
              src={matchedUser.avatarUrl}
              alt={matchedUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Companion notice if applicable */}
        {matchedUser.isCompanion && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            ✨ {matchedUser.name} is available as a verified party companion in {matchedUser.city}.
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onStartChat(matchedUser);
              onClose();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] hover:to-[#B5001D] text-white font-bold text-sm shadow-xl shadow-[#E63946]/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Say Ayubowan! 💬</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};
