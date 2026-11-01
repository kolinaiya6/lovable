import React, { useState } from 'react';
import { UserProfile, ContentReport } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Trash2, 
  X, 
  Check, 
  Flag,
  UserX
} from 'lucide-react';

interface SafetyModalsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  blockedUsers: UserProfile[];
  onUnblockUser: (userId: string) => void;
  onRequestAccountDeletion: (reason: string) => void;
}

export const SafetyModals: React.FC<SafetyModalsProps> = ({
  isOpen,
  onClose,
  currentUser,
  blockedUsers,
  onUnblockUser,
  onRequestAccountDeletion,
}) => {
  const [activeTab, setActiveTab] = useState<'policy' | 'terms' | 'ugc' | 'blocked' | 'delete'>('policy');
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletionReason.trim()) return;
    onRequestAccountDeletion(deletionReason.trim());
    setDeletionSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#14141B] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#111116]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Trust, Safety & Compliance Center</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-2 bg-[#0C0C10] border-b border-white/5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'policy' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'terms' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('ugc')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'ugc' ? 'bg-[#E63946]/20 text-[#FF758F] font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Zero-Tolerance UGC Safety
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'blocked' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Blocked Users ({blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'delete' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            GDPR Account Deletion
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'policy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Lovable LK Privacy Policy</h4>
              <p>
                Lovable LK ("we", "our") takes member privacy with utmost seriousness. We comply with modern privacy standards and data protection guidelines.
              </p>
              <h5 className="font-semibold text-white mt-2">1. Data We Collect</h5>
              <p>
                We collect your profile details (name, city, age, interests, photographs), companion service descriptions, and nightlife venue RSVPs strictly to facilitate verified social nightlife networking and safety verification.
              </p>
              <h5 className="font-semibold text-white mt-2">2. Messaging Encryption</h5>
              <p>
                Direct messages exchanged between partygoers and verified companions are stored in secure Supabase PostgreSQL database tables with Row Level Security (RLS) enforcement.
              </p>
              <h5 className="font-semibold text-white mt-2">3. Location Accuracy</h5>
              <p>
                We do not broadcast continuous live background GPS coordinates. Location distances are approximated by chosen nightlife hub (Colombo, Mirissa, Weligama, Galle, Kandy) to protect personal privacy.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Terms of Service & Party Etiquette</h4>
              <p>
                By registering for Lovable LK, you agree to treat all members, verified party companions, and venue staff with respect, dignity, and cordial Sri Lankan hospitality ("Ayubowan").
              </p>
              <h5 className="font-semibold text-white mt-2">1. Age Requirement</h5>
              <p>
                All members must be 18 years of age or older. Accounts found belonging to minors are terminated immediately.
              </p>
              <h5 className="font-semibold text-white mt-2">2. Companion Services</h5>
              <p>
                Party companions provide social, VIP event attendance, dance partnership, and networking escort services. Explicit or unlawful adult service soliciting is strictly prohibited under our zero-tolerance policy.
              </p>
              <h5 className="font-semibold text-white mt-2">3. Venue & Guestlist Rules</h5>
              <p>
                RSVP passes are subject to individual nightclub dress codes and door policies. Respect venue rules at all times.
              </p>
            </div>
          )}

          {activeTab === 'ugc' && (
            <div className="space-y-3 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Zero-Tolerance UGC Safety Standards</span>
              </div>
              <p className="text-slate-200">
                Lovable LK maintains a zero-tolerance policy against:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Harassment, abusive messaging, stalking, or discriminatory conduct.</li>
                <li>Impersonation, stolen photography, or unverified identity profiles.</li>
                <li>Solicitation of illegal substances or non-consensual behavior.</li>
                <li>Spamming or fraudulent ticketing operations.</li>
              </ul>
              <p className="pt-2 text-slate-400">
                Every profile card, party flyer, and mixology listing contains a 1-click "Report" trigger. Flagged items are routed immediately to the Super-Admin moderation queue for review within 24 hours.
              </p>
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Blocked Members List</h4>
              <p className="text-slate-400">
                Blocked members cannot view your profile, send you direct messages, or see your RSVPs.
              </p>
              {blockedUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-white/5 rounded-2xl">
                  You haven't blocked any users.
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((u) => (
                    <div key={u.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.city}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onUnblockUser(u.id)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">GDPR / Data Safety Account Deletion Request</h4>
              <p className="text-slate-400">
                In compliance with Google Play Store & international GDPR data safety regulations, you have the right to request permanent deletion of your profile, messages, and uploaded photos.
              </p>

              {deletionSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Your deletion request has been lodged and sent to the Super Admin queue for purging.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitDeletion} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reason for Account Deletion</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Please let us know why you wish to delete your profile..."
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Submit Account Deletion Request</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'profile' | 'event' | 'cocktail' | 'message';
  targetId: string;
  targetTitle: string;
  onSubmitReport: (reason: string, details: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState('Inappropriate content or photo');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-[#14141B] border border-white/15 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
          <Flag className="w-4 h-4" />
          <span>Report {targetType}</span>
        </div>

        <h3 className="font-extrabold text-white text-base mb-1 truncate">{targetTitle}</h3>
        <p className="text-xs text-slate-400 mb-4">
          Reports are handled confidentially and immediately escalated to admin moderation.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Report submitted to central command. Thank you!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
              >
                <option value="Inappropriate content or photo">Inappropriate content or photo</option>
                <option value="Fake or impersonated account">Fake or impersonated account</option>
                <option value="Harassment or abusive behavior">Harassment or abusive behavior</option>
                <option value="Prohibited or illegal solicitation">Prohibited or illegal solicitation</option>
                <option value="Spam or fraudulent ticket sales">Spam or fraudulent ticket sales</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Additional Details</label>
              <textarea
                rows={3}
                placeholder="Describe what occurred..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E63946] text-white font-bold shadow-md shadow-[#E63946]/30"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
