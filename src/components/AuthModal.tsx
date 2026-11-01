import React, { useState } from 'react';
import { UserProfile, UserRole, SriLankanCity } from '../types';
import { 
  X, 
  Sparkles, 
  ArrowRight,
  Store,
  User,
  Check,
  MapPin,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  users: UserProfile[];
  onRegisterUser: (user: UserProfile) => void;
}

const VENUE_IMAGE_OPTIONS = [
  {
    title: 'VIP Nightclub & Lounge',
    url: '/src/assets/images/venue_club_organizer_1793518298023.jpg',
  },
  {
    title: 'Skyline Lotus Vista Rooftop',
    url: '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg',
  },
  {
    title: 'Beach Club & Sunset Pool Deck',
    url: '/src/assets/images/party_event_pool_1793518326375.jpg',
  },
  {
    title: 'Underground Techno Vault',
    url: '/src/assets/images/event_techno_rave_1793512116489.jpg',
  },
  {
    title: 'Mirissa Coastal Beach Rave',
    url: '/src/assets/images/event_mirissa_beach_1793512113827.jpg',
  },
];

const MEMBER_AVATAR_OPTIONS = [
  {
    name: 'Senuri',
    tag: 'Rooftop Chic',
    url: '/src/assets/images/avatar_senuri_1793512133087.jpg',
  },
  {
    name: 'Natasha',
    tag: 'Beach Raves',
    url: '/src/assets/images/avatar_natasha_1793512134413.jpg',
  },
  {
    name: 'Kavinda',
    tag: 'Nightlife Curator',
    url: '/src/assets/images/avatar_kavinda_1793512134574.jpg',
  },
  {
    name: 'Arjun',
    tag: 'Party Host',
    url: '/src/assets/images/avatar_arjun_1793512134166.jpg',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterUser,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [role, setRole] = useState<UserRole>('user');
  const [isCompanion, setIsCompanion] = useState(false);
  const [companionHeadline, setCompanionHeadline] = useState('');
  const [companionRate, setCompanionRate] = useState('');
  const [city, setCity] = useState<SriLankanCity>('Colombo');
  const [selectedImage, setSelectedImage] = useState<string>(
    '/src/assets/images/avatar_senuri_1793512133087.jpg'
  );
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomImageUrl(reader.result);
          setSelectedImage(reader.result);
          setUploadedFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'vendor') {
      setSelectedImage(VENUE_IMAGE_OPTIONS[0].url);
      setIsCompanion(false);
    } else {
      setSelectedImage(MEMBER_AVATAR_OPTIONS[0].url);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name or venue name.');
      return;
    }

    const finalImageUrl = customImageUrl.trim() || selectedImage;
    const isVendorRole = role === 'vendor';

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member'}@lovable.lk`,
      name: name.trim(),
      age: Number(age) || 24,
      role: role,
      isCompanion: isCompanion && role === 'user',
      companionHeadline: isCompanion ? (companionHeadline || 'Verified Party Companion') : undefined,
      companionRate: isCompanion ? (companionRate || 'LKR 15,000 / evening escort') : undefined,
      city,
      distanceKm: 2.5,
      bio: isVendorRole
        ? `${name.trim()} is a premier nightlife destination located in ${city}, Sri Lanka. Offering world-class cocktails, resident DJs, and unforgettable nightlife.`
        : isCompanion 
        ? 'Charming nightlife date and party companion for curated Colombo and coastal events.'
        : 'Nightlife enthusiast looking for vibrant dance parties, cocktails, and good vibes across Sri Lanka.',
      lookingFor: isVendorRole
        ? 'Nightlife Patrons & Event Promotion'
        : isCompanion 
        ? 'Party Companion & VIP Club Buddy' 
        : 'Casual Dating & Dance Partner',
      interests: isVendorRole
        ? ['VIP Lounges', 'Mixology', 'Guest DJs', 'Private Tables']
        : ['VIP Lounges', 'Mixology', 'Techno', 'Sunset Raves'],
      avatarUrl: finalImageUrl,
      photos: [
        finalImageUrl,
        isVendorRole 
          ? '/src/assets/images/venue_club_organizer_1793518298023.jpg'
          : '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg'
      ],
      isVerified: true,
      isOnline: true,
      createdAt: new Date().toISOString(),
      trialEndsAt: isVendorRole ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : undefined,
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E63946] to-[#FF758F] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#E63946]/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Get Your Lovable LK Pass
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Join Sri Lanka’s verified nightlife, dating & companion community
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Account Role Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Select Profile Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold ${
                  role === 'user' 
                    ? 'bg-[#E63946]/20 border-[#E63946] text-white shadow-md' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-[#FF758F]" />
                <span>Partygoer / Companion</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('vendor')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold ${
                  role === 'vendor' 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Club / Venue Organizer</span>
              </button>
            </div>
          </div>

          {/* Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {role === 'vendor' ? 'Club / Venue Name' : 'Full Name or Moniker'}
              </label>
              <input
                type="text"
                required
                placeholder={role === 'vendor' ? 'e.g. Botanik Bistro & Rooftop' : 'e.g. Natasha'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sri Lankan City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as SriLankanCity)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1A1A24] border border-white/10 text-white focus:outline-none focus:border-[#E63946]"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Mirissa">Mirissa</option>
                  <option value="Weligama">Weligama</option>
                  <option value="Galle">Galle</option>
                  <option value="Ella">Ella</option>
                  <option value="Kandy">Kandy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Age or Operating Years */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {role === 'vendor' ? 'Years in Operation' : 'Age (18+)'}
            </label>
            <input
              type="number"
              min={role === 'vendor' ? 1 : 18}
              max={80}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E63946]"
            />
          </div>

          {/* IMAGE SELECTION FOR REGISTRATION */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span>
                  {role === 'vendor' ? 'Select Club / Venue Cover Image' : 'Select Profile Photo'}
                </span>
              </label>
              <span className="text-[10px] text-slate-400">Click to choose image</span>
            </div>

            {role === 'vendor' ? (
              /* Club / Venue Organizer Image Options */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VENUE_IMAGE_OPTIONS.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(opt.url);
                      setCustomImageUrl('');
                    }}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === opt.url && !customImageUrl
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/40 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img 
                      src={opt.url} 
                      alt={opt.title} 
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-semibold text-white truncate w-full">
                        {opt.title}
                      </span>
                    </div>
                    {selectedImage === opt.url && !customImageUrl && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E63946] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Partygoer & Companion Avatar Options */
              <div className="grid grid-cols-4 gap-2">
                {MEMBER_AVATAR_OPTIONS.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedImage(opt.url);
                      setCustomImageUrl('');
                    }}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === opt.url && !customImageUrl
                        ? 'border-[#E63946] ring-2 ring-[#E63946]/40 scale-[1.03]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img 
                      src={opt.url} 
                      alt={opt.name} 
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[10px] font-semibold text-white truncate w-full text-center">
                        {opt.name}
                      </span>
                    </div>
                    {selectedImage === opt.url && !customImageUrl && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E63946] flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Direct Device Upload Option */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:bg-white/15 border border-dashed border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                  <Upload className="w-4 h-4 text-[#FF758F]" />
                  <span>
                    {role === 'vendor' ? 'Upload Club / Venue Image' : 'Upload Profile Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or enter image URL..."
                  value={customImageUrl.startsWith('data:') ? '' : customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    setSelectedImage(e.target.value);
                    setUploadedFileName('');
                  }}
                  className="w-full sm:w-44 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-[11px] focus:outline-none focus:border-[#E63946]"
                />
              </div>

              {uploadedFileName && (
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                  <Check className="w-4 h-4" />
                  <span className="truncate">Uploaded: {uploadedFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Companion Toggle if User Role */}
          {role === 'user' && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={isCompanion}
                  onChange={(e) => setIsCompanion(e.target.checked)}
                  className="accent-amber-400 w-4 h-4"
                />
                <span className="font-semibold text-amber-300">Register as a Verified Party Companion ✨</span>
              </label>

              {isCompanion && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Companion Headline (e.g. VIP Rooftop Escort)"
                    value={companionHeadline}
                    onChange={(e) => setCompanionHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Hourly / Event Rate (e.g. LKR 15,000 / event)"
                    value={companionRate}
                    onChange={(e) => setCompanionRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] text-white font-extrabold text-xs shadow-lg shadow-[#E63946]/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <span>Activate Pass & Enter Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
