import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, SriLankanCity } from '../types';
import { 
  Heart, 
  X, 
  Star, 
  SlidersHorizontal, 
  LayoutGrid, 
  Layers, 
  RotateCcw, 
  Sparkles, 
  BadgeCheck, 
  MapPin, 
  Info,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface DatingDeckProps {
  currentUser: UserProfile;
  users: UserProfile[];
  passedUserIds: string[];
  onSwipeRight: (user: UserProfile) => void;
  onSwipeLeft: (user: UserProfile) => void;
  onSuperlike: (user: UserProfile) => void;
  onResetDeck: () => void;
  onSelectProfile: (user: UserProfile) => void;
}

export const DatingDeck: React.FC<DatingDeckProps> = ({
  currentUser,
  users,
  passedUserIds,
  onSwipeRight,
  onSwipeLeft,
  onSuperlike,
  onResetDeck,
  onSelectProfile,
}) => {
  const { t, language } = useLanguage();
  // View mode: 'stack' vs 'grid'
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [selectedCity, setSelectedCity] = useState<string>('All Sri Lanka');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(45);
  const [companionsOnly, setCompanionsOnly] = useState<boolean>(false);
  const [selectedInterest, setSelectedInterest] = useState<string>('All');

  // Filter available users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Exclude self and vendors
      if (u.id === currentUser.id || u.role === 'vendor') return false;
      // Filter by city
      if (selectedCity !== 'All Sri Lanka' && u.city !== selectedCity) return false;
      // Filter by companion status
      if (companionsOnly && !u.isCompanion) return false;
      // Filter by age
      if (u.age < minAge || u.age > maxAge) return false;
      // Filter by distance
      if (u.distanceKm > maxDistance) return false;
      // Filter by interest
      if (selectedInterest !== 'All' && !u.interests.includes(selectedInterest)) return false;

      return true;
    });
  }, [users, currentUser, selectedCity, companionsOnly, minAge, maxAge, maxDistance, selectedInterest]);

  // For stack mode, filter out passed ones
  const stackDeck = useMemo(() => {
    return filteredUsers.filter(u => !passedUserIds.includes(u.id));
  }, [filteredUsers, passedUserIds]);

  const currentCard = stackDeck[0];

  const handleDragEnd = (_: any, info: any) => {
    if (!currentCard) return;
    if (info.offset.x > 100) {
      onSwipeRight(currentCard);
    } else if (info.offset.x < -100) {
      onSwipeLeft(currentCard);
    }
  };

  const citiesList = ['All Sri Lanka', 'Colombo', 'Mirissa', 'Weligama', 'Galle', 'Ella', 'Kandy'];
  const allInterests = ['All', 'Techno', 'Rooftop Lounges', 'Cocktails', 'Beach Raves', 'Deep House', 'Fashion', 'Fine Dining'];

  return (
    <div className="my-8">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {t.datingTitle} <span className="text-[#FF758F]">💕</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.datingSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode('stack')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'stack'
                  ? 'bg-[#E63946] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.cardDeck}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#E63946] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t.twoColGrid}</span>
            </button>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FF758F]" />
            <span className="hidden sm:inline">{t.discoveryFilters}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: SWIPE STACK */}
      {viewMode === 'stack' ? (
        <div className="flex flex-col items-center justify-center min-h-[560px]">
          {currentCard ? (
            <div className="relative w-full max-w-sm sm:max-w-md h-[520px]">
              {/* Next card in background preview */}
              {stackDeck[1] && (
                <div className="absolute inset-0 scale-95 translate-y-3 opacity-50 rounded-3xl bg-[#14141B] border border-white/10 overflow-hidden pointer-events-none">
                  <img
                    src={stackDeck[1].avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Active Swipeable Card */}
              <AnimatePresence>
                <motion.div
                  key={currentCard.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                  className="relative w-full h-full rounded-3xl bg-[#14141B] border border-white/15 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing flex flex-col justify-end"
                >
                  <img
                    src={currentCard.avatarUrl}
                    alt={currentCard.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    {currentCard.isCompanion ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-black shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.companionRateAvailable}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-slate-200 backdrop-blur-md">
                        {t.partygoer}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProfile(currentCard);
                      }}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
                      title={t.viewProfile}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content Overlay */}
                  <div className="relative z-10 p-6 space-y-2 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-extrabold text-white">
                        {currentCard.name}, {currentCard.age}
                      </h3>
                      {currentCard.isVerified && (
                        <BadgeCheck className="w-5 h-5 text-sky-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                        <span>{SINHALA_CITIES[currentCard.city] || currentCard.city}</span>
                      </span>
                      <span>·</span>
                      <span className="text-rose-300 font-medium">{currentCard.lookingFor}</span>
                    </div>

                    {currentCard.companionRate && (
                      <p className="text-xs text-amber-300 font-semibold">
                        ✨ {currentCard.companionRate}
                      </p>
                    )}

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {currentCard.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentCard.interests.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <button
                  onClick={() => onSwipeLeft(currentCard)}
                  className="w-14 h-14 rounded-full bg-[#181820] hover:bg-[#20202C] border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title={t.passButton}
                >
                  <X className="w-6 h-6" />
                </button>

                <button
                  onClick={() => onSuperlike(currentCard)}
                  className="w-12 h-12 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title={t.superlikeButton}
                >
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </button>

                <button
                  onClick={() => onSwipeRight(currentCard)}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#E63946] to-[#FF758F] text-white flex items-center justify-center shadow-xl shadow-[#E63946]/30 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title={t.likeButton}
                >
                  <Heart className="w-6 h-6 fill-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 max-w-sm rounded-3xl bg-[#14141B] border border-white/10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.exploreDoneTitle}</h3>
              <p className="text-xs text-slate-400">
                {t.exploreDoneDesc}
              </p>
              <button
                onClick={onResetDeck}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] text-white font-semibold text-xs shadow-lg shadow-[#E63946]/20 transition-all hover:scale-105 cursor-pointer"
              >
                {t.resetCards}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: 2-COLUMN GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((profile) => (
            <div
              key={profile.id}
              className="group rounded-2xl bg-[#14141B] border border-white/10 overflow-hidden shadow-lg hover:border-[#E63946]/50 transition-all flex flex-col justify-between"
            >
              <div 
                className="relative h-64 cursor-pointer overflow-hidden"
                onClick={() => onSelectProfile(profile)}
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/30" />

                <div className="absolute top-3 left-3">
                  {profile.isCompanion ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500 text-black">
                      ✨ {t.verifiedCompanion}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-black/60 text-slate-300">
                      {t.partygoer}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 
                      onClick={() => onSelectProfile(profile)}
                      className="font-bold text-base text-white hover:text-[#FF758F] cursor-pointer"
                    >
                      {profile.name}, {profile.age}
                    </h3>
                    {profile.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-sky-400" />
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E63946]" />
                    <span>{SINHALA_CITIES[profile.city] || profile.city}</span>
                  </p>

                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {profile.interests.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => onSelectProfile(profile)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold text-center cursor-pointer"
                  >
                    {t.viewProfile}
                  </button>
                  <button
                    onClick={() => onSwipeRight(profile)}
                    className="p-2 rounded-xl bg-[#E63946]/10 hover:bg-[#E63946]/20 text-[#FF758F] border border-[#E63946]/20 cursor-pointer"
                    title={t.likeButton}
                  >
                    <Heart className="w-4 h-4 fill-[#FF758F]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISCOVERY FILTER MODAL */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#14141B] border border-white/15 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E63946]" />
                <span>{t.discoveryPreferences}</span>
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs text-slate-300">
              {/* Location Selector */}
              <div>
                <label className="block text-slate-400 font-semibold mb-2">{t.cityHotspots}</label>
                <div className="flex flex-wrap gap-1.5">
                  {citiesList.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCity(c)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        selectedCity === c 
                          ? 'bg-[#E63946] text-white font-semibold' 
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {c === 'All Sri Lanka' ? (language === 'si' ? 'මුළු ශ්‍රී ලංකාවම' : 'All Sri Lanka') : (SINHALA_CITIES[c] ? SINHALA_CITIES[c].split(' ')[0] : c)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance radius slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-400">{t.maxDistanceRadius}</span>
                  <span className="text-white font-mono">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-[#E63946] cursor-pointer"
                />
              </div>

              {/* Age Range Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-400">{t.ageRange}</span>
                  <span className="text-white font-mono">{minAge} — {maxAge} {language === 'si' ? 'වසර' : 'years'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="18"
                    max="40"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-full accent-[#E63946]"
                  />
                  <input
                    type="range"
                    min="25"
                    max="60"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className="w-full accent-[#E63946]"
                  />
                </div>
              </div>

              {/* Verified Companions Only Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-semibold text-white">{t.verifiedCompanionsOnly}</p>
                  <p className="text-[11px] text-slate-400">{t.verifiedCompanionsOnlyDesc}</p>
                </div>
                <button
                  onClick={() => setCompanionsOnly(!companionsOnly)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center cursor-pointer ${
                    companionsOnly ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      companionsOnly ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Interest Vibe Filter */}
              <div>
                <label className="block text-slate-400 font-semibold mb-2">{t.musicAndNightlifeVibe}</label>
                <div className="flex flex-wrap gap-1.5">
                  {allInterests.map((vibe) => (
                    <button
                      key={vibe}
                      onClick={() => setSelectedInterest(vibe)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                        selectedInterest === vibe 
                          ? 'bg-[#FF758F] text-black font-semibold' 
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCity('All Sri Lanka');
                  setMaxDistance(100);
                  setMinAge(18);
                  setMaxAge(50);
                  setCompanionsOnly(false);
                  setSelectedInterest('All');
                }}
                className="py-2.5 px-4 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10 cursor-pointer"
              >
                {t.resetAll}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#E63946] text-white text-xs font-semibold hover:bg-[#D90429] shadow-lg shadow-[#E63946]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t.applyFilters} ({filteredUsers.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
