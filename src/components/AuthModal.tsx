import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, SriLankanCity, ALL_SRI_LANKAN_CITIES } from '../types';
import { storage } from '../services/storage';
import { generateUUID } from '../utils/uuid';
import { 
  X, 
  Sparkles, 
  ArrowRight,
  Store, 
  User, 
  Check, 
  MapPin, 
  Upload,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Mail,
  LogIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  users: UserProfile[];
  onRegisterUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  onClose,
  onLoginSuccess,
  onRegisterUser,
}) => {
  const { t, language } = useLanguage();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  // Registration form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState(25);
  const [role, setRole] = useState<UserRole>('user');
  const [isCompanion, setIsCompanion] = useState(false);
  const [companionHeadline, setCompanionHeadline] = useState('');
  const [companionRate, setCompanionRate] = useState('');
  const [city, setCity] = useState<SriLankanCity>('Colombo');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(language === 'si' ? 'ගොනු ප්‍රමාණය 10MB ට වඩා අඩු විය යුතුය.' : 'File size must be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImageUrl(reader.result);
          setUploadedFileName(file.name);
          setErrorMessage('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setUploadedImageUrl('');
    setUploadedFileName('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'vendor') {
      setIsCompanion(false);
    }
  };

  // Registration Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(language === 'si' ? 'කරුණාකර ඔබගේ නම හෝ වෙනිව් නම ඇතුළත් කරන්න.' : 'Please enter your full name or venue name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage(language === 'si' ? 'කරුණාකර නිවැරදි ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.' : 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(language === 'si' ? 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් දිගු විය යුතුය.' : 'Password must be at least 6 characters long.');
      return;
    }

    const isVendorRole = role === 'vendor';
    const finalAvatar = uploadedImageUrl.trim() || 
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`;

    const newUser: UserProfile = {
      id: generateUUID(),
      email: email.trim().toLowerCase(),
      password: password,
      name: name.trim(),
      age: Number(age) || 24,
      role: role,
      isCompanion: isCompanion && role === 'user',
      companionHeadline: isCompanion ? (companionHeadline || (language === 'si' ? 'සත්‍යාපිත පාටි සහකරු' : 'Verified Party Companion')) : undefined,
      companionRate: isCompanion ? (companionRate || (language === 'si' ? 'රු. 15,000 / එක් ඉවෙන්ට් එකකට' : 'LKR 15,000 / evening escort')) : undefined,
      city,
      distanceKm: 2.5,
      bio: isVendorRole
        ? `${name.trim()} is an exclusive nightlife venue in ${city}, Sri Lanka. Featuring curated DJ lineups, signature cocktails, and premier table reservations.`
        : isCompanion 
        ? 'Charming nightlife companion for curated parties, cocktail evenings, and VIP club events across Sri Lanka.'
        : 'Nightlife enthusiast looking for vibrant dance parties, cocktails, and good vibes across Sri Lanka.',
      lookingFor: isVendorRole
        ? (language === 'si' ? 'පාටි ප්‍රවර්ධනය සහ රාත්‍රී අත්දැකීම්' : 'Nightlife Patrons & Event Promotion')
        : isCompanion 
        ? (language === 'si' ? 'පාටි සහකරු සහ වී.අයි.පී ක්ලබ් බඩී' : 'Party Companion & VIP Club Buddy') 
        : (language === 'si' ? 'ඩාන්ස් පාට්නර් සහ ඩේටිං' : 'Casual Dating & Dance Partner'),
      interests: isVendorRole
        ? ['VIP Lounges', 'Mixology', 'Guest DJs', 'Private Tables']
        : ['VIP Lounges', 'Mixology', 'Techno', 'Sunset Raves'],
      avatarUrl: finalAvatar,
      photos: [finalAvatar],
      isVerified: true,
      isOnline: true,
      createdAt: new Date().toISOString(),
      trialEndsAt: isVendorRole ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : undefined,
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage(language === 'si' ? 'කරුණාකර ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කරන්න.' : 'Please enter your email.');
      return;
    }

    if (!loginPassword) {
      setErrorMessage(language === 'si' ? 'කරුණාකර මුරපදය ඇතුළත් කරන්න.' : 'Please enter your password.');
      return;
    }

    const res = storage.authenticateUser(loginEmail.trim(), loginPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.error || (language === 'si' ? 'පිවිසීම අසාර්ථකයි. ඔබගේ තොරතුරු නිවැරදිදැයි පරීක්ෂා කරන්න.' : 'Authentication failed. Please verify your credentials.'));
    }
  };

  const handleSwitchToRegisterWithEmail = () => {
    setEmail(loginEmail);
    setAuthMode('register');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E63946] to-[#FF758F] flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-[#E63946]/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {authMode === 'register' ? (language === 'si' ? 'ඔබගේ ලවබල් LK පාස් එක ලබාගන්න' : 'Get Your Lovable LK Pass') : t.loginTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'register'
              ? (language === 'si' ? 'ශ්‍රී ලංකාවේ සත්‍යාපිත නයිට්ලයිෆ්, ඩේටිං සහ සහකරු ප්‍රජාවට එකතු වන්න' : 'Join Sri Lanka’s verified nightlife, dating & companion community')
              : (language === 'si' ? 'ඔබගේ ගිණුමට හෝ වෙනිව් පාලක පුවරුවට පිවිසෙන්න' : 'Access your partygoer profile or club venue dashboard')}
          </p>
        </div>

        {/* Mode Switch Tabs (Register / Login) */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'bg-[#E63946] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.newMemberPassTab}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-[#E63946] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.existingMemberLoginTab}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex flex-col gap-1.5">
            <span>{errorMessage}</span>
            {authMode === 'login' && errorMessage.includes('No account') && (
              <button
                type="button"
                onClick={handleSwitchToRegisterWithEmail}
                className="text-left font-bold text-[#FF758F] underline hover:text-white text-[11px] cursor-pointer"
              >
                {language === 'si' ? 'මෙම ඊමේල් එකෙන් දැන්ම ලියාපදිංචි වන්න →' : 'Register now with this email →'}
              </button>
            )}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
            {successMessage}
          </div>
        )}

        {/* REGISTRATION FORM */}
        {authMode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Account Role Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {language === 'si' ? 'ගිණුම් වර්ගය තෝරන්න' : 'Select Profile Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('user')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold cursor-pointer ${
                    role === 'user' 
                      ? 'bg-[#E63946]/20 border-[#E63946] text-white shadow-md' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 text-[#FF758F]" />
                  <span>{language === 'si' ? 'පාටිගෝයර් / සහකරු' : 'Partygoer / Companion'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('vendor')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold cursor-pointer ${
                    role === 'vendor' 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>{language === 'si' ? 'ක්ලබ් / වෙනිව් සංවිධායක' : 'Club / Venue Organizer'}</span>
                </button>
              </div>
            </div>

            {/* Name & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {role === 'vendor' ? (language === 'si' ? 'ක්ලබ් හෝ වෙනිව් නම' : 'Club / Venue Name') : (language === 'si' ? 'සම්පූර්ණ නම' : 'Full Name or Moniker')}
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

              {/* ALL SRI LANKAN CITIES IN DROPDOWN */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>{t.cityLabel}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{language === 'si' ? 'නගර 23ම' : 'All 23 Cities'}</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as SriLankanCity)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1A1A24] border border-white/10 text-white focus:outline-none focus:border-[#E63946] appearance-none"
                  >
                    {ALL_SRI_LANKAN_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-[#14141B] text-white">
                        {SINHALA_CITIES[c] || c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.emailLabel}</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.passwordLabel}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Age or Operating Years */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {role === 'vendor' ? (language === 'si' ? 'ක්‍රියාත්මක වන වසර ගණන' : 'Years in Operation') : (language === 'si' ? 'වයස (18+)' : 'Age (18+)')}
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

            {/* REAL DEVICE UPLOAD */}
            <div className="space-y-2 pt-1">
              <label className="block text-slate-300 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>
                    {role === 'vendor' ? (language === 'si' ? 'වෙනිව් ආවරණ ඡායාරූපය' : 'Club / Venue Cover Photo') : (language === 'si' ? 'පැතිකඩ ඡායාරූපය' : 'Profile Photo')}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400">{language === 'si' ? 'උපාංගයෙන් හෝ කැමරාවෙන්' : 'Device Upload or Camera'}</span>
              </label>

              {uploadedImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black/40 p-2 flex items-center gap-3">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded preview"
                    className="w-16 h-16 rounded-xl object-cover border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                      <Check className="w-4 h-4" />
                      <span>{t.photoReady}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {uploadedFileName || 'Image preview'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors mr-1 cursor-pointer"
                    title="Remove and select another"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="cursor-pointer py-3.5 px-4 rounded-2xl bg-gradient-to-r from-white/[0.07] to-white/[0.03] hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-white/40 text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#FF758F] group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-center">
                      <span className="text-white font-semibold">
                        {role === 'vendor' ? (language === 'si' ? 'වෙනිව් ඡායාරූපය තෝරන්න' : 'Click to upload venue cover image') : (language === 'si' ? 'ඔබගේ ඡායාරූපය තෝරන්න' : 'Click to upload your profile photo')}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{language === 'si' ? 'උපාංගයෙන් ගොනුවක් තෝරන්න' : 'Select file from device'}</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">{language === 'si' ? 'හෝ URL:' : 'Or URL:'}</span>
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={uploadedImageUrl.startsWith('data:') ? '' : uploadedImageUrl}
                      onChange={(e) => {
                        setUploadedImageUrl(e.target.value);
                        setUploadedFileName('Custom URL image');
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-[11px] focus:outline-none focus:border-[#E63946]"
                    />
                  </div>
                </div>
              )}
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
                  <span className="font-semibold text-amber-300">
                    {language === 'si' ? 'සත්‍යාපිත පාටි සහකරුවෙකු ලෙස ලියාපදිංචි වන්න ✨' : 'Register as a Verified Party Companion ✨'}
                  </span>
                </label>

                {isCompanion && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder={language === 'si' ? 'සහකරු සිරස්තලය (උදා: VIP Rooftop Escort)' : 'Companion Headline (e.g. VIP Rooftop Escort)'}
                      value={companionHeadline}
                      onChange={(e) => setCompanionHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder={language === 'si' ? 'ගාස්තු (උදා: රු. 15,000 / එක් ඉවෙන්ට් එකකට)' : 'Hourly / Event Rate (e.g. LKR 15,000 / event)'}
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] text-white font-extrabold text-xs shadow-lg shadow-[#E63946]/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{t.activatePassAndEnter}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className="text-slate-400 hover:text-white transition-colors text-[11px] cursor-pointer"
              >
                {t.haveAccount}
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.emailLabel}</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.passwordLabel}</span>
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] text-white font-extrabold text-xs shadow-lg shadow-[#E63946]/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>{t.signInAndContinue}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                className="text-slate-400 hover:text-white transition-colors text-[11px] cursor-pointer"
              >
                {t.noAccount}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
