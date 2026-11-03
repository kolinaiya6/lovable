import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  X, 
  BadgeCheck, 
  MapPin, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Flag, 
  ShieldAlert, 
  Instagram, 
  Clock, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface ProfileModalProps {
  profile: UserProfile | null;
  onClose: () => void;
  onLike: (profile: UserProfile) => void;
  onSendLove: (profile: UserProfile) => void;
  onChat: (profile: UserProfile) => void;
  onReport: (targetType: 'profile', targetId: string, title: string) => void;
  onBlock: (targetId: string, name: string) => void;
  isFriendRequested?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onLike,
  onSendLove,
  onChat,
  onReport,
  onBlock,
  isFriendRequested = false,
}) => {
  const { t, language } = useLanguage();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!profile) return null;

  const photos = profile.photos?.length ? profile.photos : [profile.avatarUrl];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#121218] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto no-scrollbar flex-1">
          {/* Main Photo Carousel */}
          <div className="relative h-80 sm:h-96 w-full bg-black">
            <img
              src={photos[activePhotoIdx]}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-black/40" />

            {/* Thumbnail selector if multiple photos */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'border-[#E63946] scale-105' : 'border-white/30 opacity-70'
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Verification & Companion pill */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {profile.isCompanion && (
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-black shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.verifiedCompanion}</span>
                </div>
              )}
              {profile.isOnline && (
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>{t.activeNow}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {profile.name}, {profile.age}
                  </h1>
                  {profile.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-sky-400" />
                  )}
                </div>

                {profile.companionRate && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs sm:text-sm">
                    {profile.companionRate}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#E63946]" />
                  <span>{SINHALA_CITIES[profile.city] || profile.city}</span>
                </span>
                <span>·</span>
                <span className="text-slate-300 font-medium">
                  {language === 'si' ? 'අපේක්ෂාව:' : 'Looking for:'} {profile.lookingFor}
                </span>
              </div>

              {profile.companionHeadline && (
                <p className="mt-3 text-sm text-amber-200/90 font-medium italic">
                  "{profile.companionHeadline}"
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {language === 'si' ? 'මා ගැන' : 'About Me'}
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-white/5">
                {profile.bio}
              </p>
            </div>

            {/* Interests & Music */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {language === 'si' ? 'නයිට්ලයිෆ් සහ සංගීත මනාපයන්' : 'Nightlife & Vibe Interests'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 text-slate-200 border border-white/10"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Social & Meta Details */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-white/10">
              {profile.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#FF758F]" />
                  <span>{profile.instagram}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{language === 'si' ? 'එක්වූයේ:' : 'Joined'} {new Date(profile.createdAt).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Safety & Report Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
              <button
                onClick={() => onReport('profile', profile.id, `Profile: ${profile.name}`)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{language === 'si' ? 'අනුචිත අන්තර්ගත වාර්තා කරන්න' : 'Report Inappropriate Content'}</span>
              </button>

              <button
                onClick={() => onBlock(profile.id, profile.name)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{language === 'si' ? 'අවහිර කරන්න (Block)' : 'Block User'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="p-4 sm:p-6 bg-[#0E0E14] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => onLike(profile)}
            className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Heart className="w-4 h-4 text-[#FF758F]" />
            <span>{t.likeButton}</span>
          </button>

          <button
            onClick={() => onSendLove(profile)}
            disabled={isFriendRequested}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isFriendRequested 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-[#E63946] to-[#FF758F] text-white shadow-lg shadow-[#E63946]/30 hover:scale-[1.02]'
            }`}
          >
            {isFriendRequested ? (
              <>
                <Check className="w-4 h-4" />
                <span>{language === 'si' ? 'ආදරය යවන ලදී 💕' : 'Love Sent 💕'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.addLoveButton}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onChat(profile);
              onClose();
            }}
            className="py-3 px-4 rounded-xl bg-[#2A2A38] hover:bg-[#343446] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{t.chatNowButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
