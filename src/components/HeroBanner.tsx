import React from 'react';
import { Flame, Radio, Music, MapPin, Users, HeartHandshake } from 'lucide-react';
import { PartyEvent } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface HeroBannerProps {
  featuredEvent: PartyEvent;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onExploreRaves: () => void;
  onMeetCompanions: () => void;
  totalAttendeesCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredEvent,
  onExploreRaves,
  onMeetCompanions,
  totalAttendeesCount,
}) => {
  const { t, language } = useLanguage();

  const cityDisplay = language === 'si' && SINHALA_CITIES[featuredEvent.city] 
    ? SINHALA_CITIES[featuredEvent.city] 
    : featuredEvent.city;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121218] my-6">
      {/* Background with contrast scrim */}
      <div className="absolute inset-0">
        <img
          src={featuredEvent.flyerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'}
          alt="Sri Lanka Nightlife Rooftop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0D] via-[#0A0A0D]/60 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
        {/* Live Badges Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E63946]/20 border border-[#E63946]/40 text-[#FF758F] text-xs font-semibold tracking-wide">
            <Radio className="w-3.5 h-3.5 text-[#E63946] animate-pulse" />
            <span>{t.activeTonight}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'si' ? 'නෙළුම් කුළුණ සජීවී ඩීජේ' : 'Lotus Vista Live DJ'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span className="tabular-nums font-semibold">{totalAttendeesCount + 42}</span>
            <span>{t.attendeesCount}</span>
          </div>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 text-balance">
          {t.heroTitleLine1} <span className="bg-gradient-to-r from-[#FF758F] via-[#E63946] to-[#FFB703] bg-clip-text text-transparent">{t.heroTitleHighlight}</span> {t.heroTitleLine2}.
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
          {t.heroSubtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExploreRaves}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] hover:to-[#B5001D] text-white font-semibold text-sm shadow-xl shadow-[#E63946]/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>{t.heroCtaParties}</span>
          </button>

          <button
            onClick={onMeetCompanions}
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#FF758F]" />
            <span>{t.heroCtaCompanions}</span>
          </button>
        </div>

        {/* Featured Spot Preview Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#E63946]" />
            <span className="font-semibold text-white">{featuredEvent.venueName}</span>
            <span className="text-slate-500">·</span>
            <span>{cityDisplay}</span>
            <span className="text-slate-500">·</span>
            <span className="text-[#FF758F] font-medium">{featuredEvent.entryPrice}</span>
          </div>

          <div className="text-slate-400">
            {language === 'si' ? 'නෙළුම් කුළුණ රාත්‍රී දසුන් • රාත්‍රී 9:00 සිට' : 'Colombo Lotus Tower Skyline View • 9:00 PM onwards'}
          </div>
        </div>
      </div>
    </div>
  );
};
