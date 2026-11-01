import React, { useState } from 'react';
import { UserProfile, UserRole, SriLankanCity } from '../types';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Store,
  User
} from 'lucide-react';

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
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  users,
  onRegisterUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [role, setRole] = useState<UserRole>('user');
  const [isCompanion, setIsCompanion] = useState(false);
  const [companionHeadline, setCompanionHeadline] = useState('');
  const [companionRate, setCompanionRate] = useState('');
  const [city, setCity] = useState<SriLankanCity>('Colombo');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Check if account exists
    const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!matchedUser) {
      // Seamless redirection to Registration with email prefilled as requested!
      setInfoMessage('Account not found with this email. We’ve redirected you to quick registration!');
      setMode('register');
      return;
    }

    // Login successful
    onLoginSuccess(matchedUser);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter your full name or party moniker.');
      return;
    }

    // Check if email is kolinaiya6@gmail.com -> automatically assign super-admin role
    const assignedRole: UserRole = email.trim().toLowerCase() === 'kolinaiya6@gmail.com' ? 'admin' : role;

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      age: Number(age) || 24,
      role: assignedRole,
      isCompanion: isCompanion && assignedRole === 'user',
      companionHeadline: isCompanion ? (companionHeadline || 'Verified Party Companion') : undefined,
      companionRate: isCompanion ? (companionRate || 'LKR 15,000 / evening escort') : undefined,
      city,
      distanceKm: 3.0,
      bio: isCompanion 
        ? 'Charming nightlife date and party companion for curated Colombo and coastal events.'
        : 'Nightlife lover and partygoer looking for good vibes across Sri Lanka.',
      lookingFor: isCompanion ? 'Party Companion & VIP Club Buddy' : 'Casual Dating & Dance Partner',
      interests: ['VIP Lounges', 'Mixology', 'Techno', 'Sunset Raves'],
      avatarUrl: isCompanion 
        ? '/src/assets/images/avatar_senuri_1793512133087.jpg' 
        : '/src/assets/images/avatar_kavinda_1793512134574.jpg',
      photos: [
        '/src/assets/images/avatar_senuri_1793512133087.jpg',
        '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg'
      ],
      isVerified: assignedRole === 'admin',
      isOnline: true,
      createdAt: new Date().toISOString(),
      trialEndsAt: assignedRole === 'vendor' ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : undefined,
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
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
            {mode === 'login' ? 'Welcome Back to Lovable LK' : 'Create Your Nightlife Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? 'Access guestlists, direct chats, and companion reservations' 
              : 'Join Sri Lanka’s verified nightlife & party companion community'}
          </p>
        </div>

        {/* Error or Notice Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password (Min 6 characters)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] hover:to-[#B5001D] text-white font-bold text-xs shadow-lg shadow-[#E63946]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('register');
                }}
                className="text-[#FF758F] font-semibold hover:underline"
              >
                Register Here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name / Display Moniker</label>
              <input
                type="text"
                required
                placeholder="Senuri Jayawardena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-8 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">City / Base</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Mirissa">Mirissa</option>
                  <option value="Weligama">Weligama</option>
                  <option value="Galle">Galle</option>
                  <option value="Ella">Ella</option>
                  <option value="Kandy">Kandy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="70"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    role === 'user' 
                      ? 'border-[#E63946] bg-[#E63946]/10 text-white font-semibold' 
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  <User className="w-4 h-4 text-[#FF758F]" />
                  <span>Partygoer / Companion</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    role === 'vendor' 
                      ? 'border-amber-500 bg-amber-500/10 text-white font-semibold' 
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Club / Venue Organizer</span>
                </button>
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
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Hourly / Event Rate (e.g. LKR 15,000 / event)"
                      value={companionRate}
                      onChange={(e) => setCompanionRate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] text-white font-bold text-xs shadow-lg shadow-[#E63946]/30 transition-all hover:scale-[1.01]"
            >
              Complete Registration
            </button>

            <div className="text-center pt-1">
              <span className="text-slate-400">Already a member? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('login');
                }}
                className="text-[#FF758F] font-semibold hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
