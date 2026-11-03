import React from 'react';
import { UserProfile } from '../types';
import { BadgeCheck, MapPin, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface CompanionCarouselProps {
  companions: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onLikeProfile: (profile: UserProfile) => void;
  onChatProfile: (profile: UserProfile) => void;
}

export const CompanionCarousel: React.FC<CompanionCarouselProps> = ({
  companions,
  onSelectProfile,
  onLikeProfile,
  onChatProfile,
}) => {
  const { t, language } = useLanguage();

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {t.singlesAndCompanions} <span className="text-amber-400">✨</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.singlesSubtitle}
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          {language === 'si' ? 'තව බලන්න ස්ක්‍රෝල් කරන්න →' : 'Scroll to explore →'}
        </div>
      </div>

      <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {companions.map((profile) => (
          <div
            key={profile.id}
            className="group relative w-64 sm:w-72 shrink-0 rounded-2xl bg-[#14141B] border border-white/10 overflow-hidden shadow-lg hover:border-[#E63946]/50 transition-all hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Image banner with overlay */}
            <div 
              className="relative h-72 cursor-pointer overflow-hidden"
              onClick={() => onSelectProfile(profile)}
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/30" />

              {/* Status / Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                {profile.isCompanion ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/90 text-black shadow-md flex items-center gap-1 backdrop-blur-md">
                    <Sparkles className="w-3 h-3" />
                    <span>{t.verifiedCompanion}</span>
                  </span>
                ) : profile.isOnline ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/80 text-white shadow-md flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{t.activeNow}</span>
                  </span>
                ) : null}
              </div>

              {/* Companion headline pill if exists */}
              {profile.companionRate && (
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-400/30 truncate max-w-full">
                    {profile.companionRate}
                  </span>
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 
                      onClick={() => onSelectProfile(profile)}
                      className="font-bold text-base text-white hover:text-[#FF758F] cursor-pointer truncate"
                    >
                      {profile.name}, {profile.age}
                    </h3>
                    {profile.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E63946]" />
                    <span>{SINHALA_CITIES[profile.city] ? SINHALA_CITIES[profile.city].split(' ')[0] : profile.city}</span>
                  </span>
                  <span>·</span>
                  <span className="truncate">{profile.lookingFor}</span>
                </div>

                {/* Interest tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.interests.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card action buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => onSelectProfile(profile)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{t.meetButton}</span>
                </button>

                <button
                  onClick={() => onLikeProfile(profile)}
                  className="p-2 rounded-xl bg-[#E63946]/10 hover:bg-[#E63946]/20 text-[#FF758F] border border-[#E63946]/30 transition-colors cursor-pointer"
                  title={t.addLoveButton}
                >
                  <Heart className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onChatProfile(profile)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors cursor-pointer"
                  title={t.chatNowButton}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
