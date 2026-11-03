import React, { useState, useMemo } from 'react';
import { PartyEvent, UserProfile } from '../types';
import { 
  Flame, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Check, 
  Phone, 
  Share2, 
  ExternalLink, 
  X, 
  Music, 
  Users,
  Radio
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface EventsSectionProps {
  events: PartyEvent[];
  users: UserProfile[];
  currentUser: UserProfile | null;
  savedEventIds: string[];
  onToggleRsvp: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
  onRequireAuth: () => void;
  onSelectEventProfile?: (user: UserProfile) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  users,
  currentUser,
  savedEventIds,
  onToggleRsvp,
  onToggleSave,
  onRequireAuth,
  onSelectEventProfile,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<PartyEvent | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const categories = [
    { id: 'All', label: language === 'si' ? 'සියලුම සාද' : 'All Parties' },
    { id: 'VIP Rooftop', label: language === 'si' ? 'වී.අයි.පී රූෆ්ටොප්' : 'VIP Rooftop' },
    { id: 'Beach Party', label: language === 'si' ? 'වෙරළ සාද' : 'Beach Party' },
    { id: 'Techno Rave', label: language === 'si' ? 'ටෙක්නෝ රේව්' : 'Techno Rave' },
    { id: 'Ladies Night', label: language === 'si' ? 'කාන්තා රාත්‍රිය' : 'Ladies Night' },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(query);
        const matchVenue = e.venueName.toLowerCase().includes(query);
        const matchCity = e.city.toLowerCase().includes(query);
        return matchTitle || matchVenue || matchCity;
      }
      return true;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleShare = (event: PartyEvent) => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {t.eventsTitle} <Flame className="w-5 h-5 text-[#E63946]" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.eventsSubtitle}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'si' ? 'වෙනිව් හෝ නගරය සොයන්න...' : 'Search venue or city...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
          />
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => {
          const isGoing = currentUser ? evt.attendeeIds.includes(currentUser.id) : false;
          const isSaved = savedEventIds.includes(evt.id);
          const attendeeUsers = users.filter(u => evt.attendeeIds.includes(u.id));

          return (
            <div
              key={evt.id}
              className="group rounded-3xl bg-[#121218] border border-white/10 overflow-hidden hover:border-[#E63946]/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div 
                className="relative h-60 cursor-pointer overflow-hidden"
                onClick={() => setSelectedEvent(evt)}
              >
                <img
                  src={evt.flyerUrl}
                  alt={evt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-black/40" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-slate-200 backdrop-blur-md border border-white/10">
                    {evt.category}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser) {
                        onRequireAuth();
                        return;
                      }
                      onToggleSave(evt.id);
                    }}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-[#FF758F]" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Live indicators */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  {evt.isActiveTonight && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E63946] text-white flex items-center gap-1 shadow">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>{language === 'si' ? 'අද රාත්‍රියේ' : 'TONIGHT'}</span>
                    </span>
                  )}
                  {evt.isLiveDJ && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/80 text-black flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>{language === 'si' ? 'සජීවී ඩීජේ' : 'Live Set'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#FF758F]">{evt.entryPrice}</span>
                    <span className="text-xs text-slate-400">
                      {language === 'si' && SINHALA_CITIES[evt.city] ? SINHALA_CITIES[evt.city] : evt.city}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedEvent(evt)}
                    className="text-lg font-bold text-white hover:text-[#FF758F] transition-colors mt-1 cursor-pointer leading-tight"
                  >
                    {evt.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{evt.dateStr}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                      <span className="truncate max-w-[120px]">{evt.venueName}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* Attendees Stack & RSVP Button */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  {/* Attendee Avatar Stack */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {attendeeUsers.slice(0, 4).map((att) => (
                        <img
                          key={att.id}
                          src={att.avatarUrl}
                          alt={att.name}
                          className="inline-block h-7 w-7 rounded-full ring-2 ring-[#121218] object-cover cursor-pointer"
                          title={att.name}
                          onClick={() => onSelectEventProfile && onSelectEventProfile(att)}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      <strong className="text-white font-mono">{evt.attendeeIds.length}</strong> {language === 'si' ? 'සහභාගී වේ' : 'attending'}
                    </span>
                  </div>

                  {/* RSVP Button */}
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onRequireAuth();
                        return;
                      }
                      onToggleRsvp(evt.id);
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isGoing
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#E63946] hover:bg-[#D90429] text-white shadow-md shadow-[#E63946]/20'
                    }`}
                  >
                    {isGoing ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'si' ? 'ලියාපදිංචි විය 🥂' : 'Guestlist Confirmed 🥂'}</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        <span>{language === 'si' ? 'RSVP වන්න' : 'RSVP / Guestlist'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div 
            className="relative w-full max-w-2xl bg-[#14141B] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto no-scrollbar flex-1">
              <div className="relative h-72 w-full">
                <img
                  src={selectedEvent.flyerUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/30" />
                <div className="absolute bottom-4 left-6">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E63946] text-white">
                    {selectedEvent.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-2">
                    <span className="text-[#FF758F] font-bold">{selectedEvent.entryPrice}</span>
                    <span>·</span>
                    <span>{selectedEvent.venueName}</span>
                    <span>·</span>
                    <span>{selectedEvent.city}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF758F]" />
                    <span>{selectedEvent.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF758F]" />
                    <span>{selectedEvent.timeStr}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E63946]" />
                    <span>{selectedEvent.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{selectedEvent.phone}</span>
                  </div>
                </div>

                {selectedEvent.djLineup && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      DJ Lineup & Performers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.djLineup.map((dj, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 font-medium">
                          🎧 {dj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Experience Details
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Google Maps Link & Venue Contacts */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedEvent.venueName + ' ' + selectedEvent.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-[#FF758F]" />
                    <span>Google Maps Directions</span>
                  </a>

                  <button
                    onClick={() => handleShare(selectedEvent)}
                    className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedShare ? 'Link Copied!' : 'Share Event'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal RSVP Footer */}
            <div className="p-4 sm:p-6 bg-[#0E0E14] border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                <strong className="text-white font-mono">{selectedEvent.attendeeIds.length}</strong> partygoers on guestlist
              </span>

              <button
                onClick={() => {
                  if (!currentUser) {
                    onRequireAuth();
                    return;
                  }
                  onToggleRsvp(selectedEvent.id);
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] text-white text-xs font-bold shadow-lg shadow-[#E63946]/20"
              >
                {selectedEvent.attendeeIds.includes(currentUser?.id || '')
                  ? 'Leave Guestlist'
                  : 'RSVP / Join Guestlist 🥂'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
