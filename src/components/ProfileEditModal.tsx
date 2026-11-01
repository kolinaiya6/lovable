import React, { useState } from 'react';
import { UserProfile, SriLankanCity, ALL_SRI_LANKAN_CITIES } from '../types';
import { X, Sparkles, MapPin, Check, Upload, Image as ImageIcon } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age);
  const [city, setCity] = useState<SriLankanCity>(currentUser.city);
  const [bio, setBio] = useState(currentUser.bio);
  const [lookingFor, setLookingFor] = useState(currentUser.lookingFor);
  const [interestsStr, setInterestsStr] = useState(currentUser.interests.join(', '));
  const [isCompanion, setIsCompanion] = useState(currentUser.isCompanion);
  const [companionHeadline, setCompanionHeadline] = useState(currentUser.companionHeadline || '');
  const [companionRate, setCompanionRate] = useState(currentUser.companionRate || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interests = interestsStr.split(',').map(s => s.trim()).filter(Boolean);

    onSave({
      name,
      age: Number(age) || currentUser.age,
      city,
      bio,
      lookingFor,
      interests,
      isCompanion,
      companionHeadline: isCompanion ? companionHeadline : undefined,
      companionRate: isCompanion ? companionRate : undefined,
      avatarUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-extrabold text-xl text-white mb-1">Edit Nightlife Profile</h3>
        <p className="text-xs text-slate-400 mb-6">
          Keep your dating and party companion profile fresh and captivating
        </p>

        {savedSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile updated successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">City / Region</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as SriLankanCity)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  {ALL_SRI_LANKAN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-[#1C1C26] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Looking For</label>
                <input
                  type="text"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="e.g. Party Companion & Dance Partner"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            {/* Profile Photo Upload & Preview */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Profile Photo</label>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#E63946] shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all w-fit border border-white/20">
                    <Upload className="w-3.5 h-3.5 text-[#FF758F]" />
                    <span>Upload New Photo</span>
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
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Interests (comma separated)</label>
              <input
                type="text"
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            {/* Companion Preferences */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={isCompanion}
                  onChange={(e) => setIsCompanion(e.target.checked)}
                  className="accent-amber-400 w-4 h-4"
                />
                <span className="font-semibold text-amber-300">
                  Enable Verified Party Companion Profile ✨
                </span>
              </label>

              {isCompanion && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Companion Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Rooftop & Cocktail Companion"
                      value={companionHeadline}
                      onChange={(e) => setCompanionHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Companion Rate</label>
                    <input
                      type="text"
                      placeholder="e.g. LKR 20,000 / evening escort"
                      value={companionRate}
                      onChange={(e) => setCompanionRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] text-white font-bold shadow-md shadow-[#E63946]/30"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
