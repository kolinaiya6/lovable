import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  X, 
  Check, 
  Flag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, language } = useLanguage();
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
            <h3 className="font-bold text-base text-white">{t.trustAndSafetyCenter}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-2 bg-[#0C0C10] border-b border-white/5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'policy' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.privacyPolicyTab}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'terms' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.termsOfServiceTab}
          </button>
          <button
            onClick={() => setActiveTab('ugc')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ugc' ? 'bg-[#E63946]/20 text-[#FF758F] font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.ugcSafetyTab}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'blocked' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.blockedUsersTab} ({blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'delete' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.gdprAccountDeletionTab}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'policy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'si' ? 'ලවබල් LK පෞද්ගලිකත්ව ප්‍රතිපත්තිය' : 'Lovable LK Privacy Policy'}
              </h4>
              <p>
                {language === 'si'
                  ? 'ලවබල් LK ("අපි") සාමාජිකයින්ගේ දත්ත ආරක්ෂාව සහ පෞද්ගලිකත්වය උපරිම වගකීමෙන් යුතුව සුරක්ෂිත කරයි. ශ්‍රී ලංකාවේ නීතිමය රාමුවට සහ ජාත්‍යන්තර රෙගුලාසි වලට අනුකූලව අපි කටයුතු කරමු.'
                  : 'Lovable LK ("we", "our") takes member privacy with utmost seriousness. We comply with modern privacy standards and data protection guidelines.'}
              </p>
              <h5 className="font-semibold text-white mt-2">
                {language === 'si' ? '1. අප එක්රැස් කරන තොරතුරු' : '1. Data We Collect'}
              </h5>
              <p>
                {language === 'si'
                  ? 'ඔබගේ නම, නගරය, වයස, පැතිකඩ ඡායාරූප, සහකරුවන්ගේ ගාස්තු සහ වෙනිව් RSVP තොරතුරු සුරක්ෂිත සමාජශාලා අත්දැකීමක් තහවුරු කිරීම සඳහා පමණක් භාවිත වේ.'
                  : 'We collect your profile details (name, city, age, interests, photographs), companion service descriptions, and nightlife venue RSVPs strictly to facilitate verified social nightlife networking and safety verification.'}
              </p>
              <h5 className="font-semibold text-white mt-2">
                {language === 'si' ? '2. සංකේතාත්මක පණිවිඩ හුවමාරුව' : '2. Messaging Encryption'}
              </h5>
              <p>
                {language === 'si'
                  ? 'සාමාජිකයින් අතර හුවමාරු වන පණිවිඩ Supabase Row-Level Security (RLS) මගින් සංකේතනය කර ආරක්ෂිතව තබා ඇත.'
                  : 'Direct messages exchanged between partygoers and verified companions are stored in secure Supabase PostgreSQL database tables with Row Level Security (RLS) enforcement.'}
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'si' ? 'සේවා කොන්දේසි සහ පාටි විනය' : 'Terms of Service & Party Etiquette'}
              </h4>
              <p>
                {language === 'si'
                  ? 'ලවබල් LK වේදිකාව භාවිතා කිරීමේදී සියලුම සාමාජිකයින්ට, පාටි සහකරුවන්ට සහ වෙනිව් කාර්ය මණ්ඩලයට ගෞරවයෙන් සහ ශ්‍රී ලාංකේය ආගන්තුක සත්කාරයෙන් ("ආයුබෝවන්") යුතුව සැලකීමට ඔබ එකඟ වේ.'
                  : 'By registering for Lovable LK, you agree to treat all members, verified party companions, and venue staff with respect, dignity, and cordial Sri Lankan hospitality ("Ayubowan").'}
              </p>
              <h5 className="font-semibold text-white mt-2">
                {language === 'si' ? '1. වයස් සීමාව' : '1. Age Requirement'}
              </h5>
              <p>
                {language === 'si'
                  ? 'සියලුම සාමාජිකයින් වයස අවුරුදු 18ට වැඩි විය යුතුය. වයස 18ට අඩු ගිණුම් වහාම අත්හිටුවනු ලැබේ.'
                  : 'All members must be 18 years of age or older. Accounts found belonging to minors are terminated immediately.'}
              </p>
            </div>
          )}

          {activeTab === 'ugc' && (
            <div className="space-y-3 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'si' ? 'ශුන්‍ය ඉවසීමේ ආරක්ෂක ප්‍රතිපත්තිය' : 'Zero-Tolerance UGC Safety Standards'}</span>
              </div>
              <p className="text-slate-200">
                {language === 'si'
                  ? 'ලවබල් LK හි පහත සඳහන් කිසිදු ක්‍රියාවකට ඉඩ නොදෙනු ලැබේ:'
                  : 'Lovable LK maintains a zero-tolerance policy against:'}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>{language === 'si' ? 'හිරිහැර කිරීම්, තර්ජන හෝ අයථා හැසිරීම්.' : 'Harassment, abusive messaging, stalking, or discriminatory conduct.'}</li>
                <li>{language === 'si' ? 'ව්‍යාජ ගිණුම් හෝ අනවසර ඡායාරූප භාවිතය.' : 'Impersonation, stolen photography, or unverified identity profiles.'}</li>
                <li>{language === 'si' ? 'නීතිවිරෝධී ද්‍රව්‍ය ප්‍රවර්ධනය හෝ ගනුදෙනු.' : 'Solicitation of illegal substances or non-consensual behavior.'}</li>
              </ul>
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">
                {language === 'si' ? 'අවහිර කරන ලද සාමාජිකයින්ගේ ලැයිස්තුව' : 'Blocked Members List'}
              </h4>
              {blockedUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-white/5 rounded-2xl">
                  {language === 'si' ? 'ඔබ කිසිදු සාමාජිකයෙකු අවහිර කර නොමැත.' : "You haven't blocked any users."}
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
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {language === 'si' ? 'අවහිරය ඉවත් කරන්න' : 'Unblock'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                {language === 'si' ? 'ගිණුම ස්ථිරවම මකා දැමීම (GDPR)' : 'GDPR / Data Safety Account Deletion Request'}
              </h4>
              <p className="text-slate-400">
                {language === 'si'
                  ? 'ඔබගේ පැතිකඩ, ඡායාරූප සහ පණිවිඩ ස්ථිරවම මකා දැමීමට පහතින් හේතුව දක්වා අයදුම් කරන්න.'
                  : 'In compliance with international GDPR regulations, you have the right to request permanent deletion of your profile, messages, and uploaded photos.'}
              </p>

              {deletionSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{language === 'si' ? 'ඔබගේ ඉල්ලීම සාර්ථකව යොමු කරන ලදී.' : 'Your deletion request has been lodged and sent to the Super Admin queue for purging.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitDeletion} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {language === 'si' ? 'ගිණුම මකා දැමීමට හේතුව' : 'Reason for Account Deletion'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={language === 'si' ? 'කරුණාකර ඔබ ගිණුම මකා දැමීමට කැමති හේතුව දක්වන්න...' : 'Please let us know why you wish to delete your profile...'}
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'si' ? 'ගිණුම මකා දැමීමේ ඉල්ලීම යොමු කරන්න' : 'Submit Account Deletion Request'}</span>
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
  const { language } = useLanguage();
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
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
          <Flag className="w-4 h-4" />
          <span>{language === 'si' ? 'වාර්තා කරන්න' : 'Report'} ({targetType})</span>
        </div>

        <h3 className="font-extrabold text-white text-base mb-1 truncate">{targetTitle}</h3>
        <p className="text-xs text-slate-400 mb-4">
          {language === 'si' ? 'ඔබගේ පැමිණිල්ල රහසිගතව පරීක්ෂා කර පියවර ගනු ලැබේ.' : 'Reports are handled confidentially and immediately escalated to admin moderation.'}
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{language === 'si' ? 'වාර්තාව සාර්ථකව යොමු විය. ස්තුතියි!' : 'Report submitted to central command. Thank you!'}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'si' ? 'හේතුව' : 'Reason'}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
              >
                <option value="Inappropriate content or photo">{language === 'si' ? 'අනුචිත අන්තර්ගත හෝ ඡායාරූප' : 'Inappropriate content or photo'}</option>
                <option value="Fake or impersonated account">{language === 'si' ? 'ව්‍යාජ හෝ අනෙකෙකු ලෙස පෙනී සිටීම' : 'Fake or impersonated account'}</option>
                <option value="Harassment or abusive behavior">{language === 'si' ? 'හිරිහැර කිරීම් හෝ අපචාර' : 'Harassment or abusive behavior'}</option>
                <option value="Prohibited or illegal solicitation">{language === 'si' ? 'නීතිවිරෝධී කටයුතු' : 'Prohibited or illegal solicitation'}</option>
                <option value="Spam or fraudulent ticket sales">{language === 'si' ? 'වංචනික ටිකට්පත් හෝ ස්පෑම්' : 'Spam or fraudulent ticket sales'}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'si' ? 'අමතර තොරතුරු' : 'Additional Details'}
              </label>
              <textarea
                rows={3}
                placeholder={language === 'si' ? 'සිදුවූ දෙය විස්තර කරන්න...' : 'Describe what occurred...'}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold cursor-pointer"
              >
                {language === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E63946] text-white font-bold shadow-md shadow-[#E63946]/30 cursor-pointer"
              >
                {language === 'si' ? 'වාර්තාව යොමු කරන්න' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
