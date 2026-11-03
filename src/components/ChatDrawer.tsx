import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, FriendRequest, LoveMatch } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  BadgeCheck, 
  Heart, 
  Wine, 
  Calendar, 
  MapPin, 
  Check, 
  CheckCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SINHALA_CITIES } from '../utils/translations';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  users: UserProfile[];
  messages: ChatMessage[];
  matches: LoveMatch[];
  friendRequests: FriendRequest[];
  selectedChatUser: UserProfile | null;
  onSelectChatUser: (user: UserProfile) => void;
  onSendMessage: (recipientId: string, text: string, attachmentType?: 'party_invite' | 'cocktail_cheers') => void;
  onRespondFriendRequest: (requestId: string, status: 'accepted' | 'declined') => void;
  onOpenProfile: (user: UserProfile) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  messages,
  matches,
  friendRequests,
  selectedChatUser,
  onSelectChatUser,
  onSendMessage,
  onRespondFriendRequest,
  onOpenProfile,
}) => {
  const { t, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Incoming friend requests for current user
  const incomingRequests = friendRequests.filter(
    r => r.toUserId === currentUser.id && r.status === 'pending'
  );

  // Users with whom current user has chat or matches
  const conversationUsers = users.filter(u => {
    if (u.id === currentUser.id) return false;
    const isMatched = matches.some(m => 
      (m.user1Id === currentUser.id && m.user2Id === u.id) ||
      (m.user1Id === u.id && m.user2Id === currentUser.id)
    );
    const hasMsgs = messages.some(m => 
      (m.senderId === currentUser.id && m.recipientId === u.id) ||
      (m.senderId === u.id && m.recipientId === currentUser.id)
    );
    return isMatched || hasMsgs;
  });

  // Current conversation messages
  const currentMessages = selectedChatUser
    ? messages.filter(
        m =>
          (m.senderId === currentUser.id && m.recipientId === selectedChatUser.id) ||
          (m.senderId === selectedChatUser.id && m.recipientId === currentUser.id)
      )
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedChatUser) return;
    onSendMessage(selectedChatUser.id, inputText.trim());
    setInputText('');

    // Simulate natural companion typing indicator reply
    if (selectedChatUser.isCompanion || selectedChatUser.role === 'user') {
      setTimeout(() => {
        setIsTyping(true);
      }, 1000);

      setTimeout(() => {
        setIsTyping(false);
        const replyResponses = language === 'si' ? [
          `අද රෑ ඔබව හමුවීමට බලාපොරොත්තු වෙනවා! 🥂 අපි Botanik හෝ Lotus Vista හිදී හමුවෙමුද?`,
          `නියමයි! අපි රූෆ්ටොප් එකේදී කොක්ටේල් එකක් බොමු. ✨`,
          `ආයුබෝවන්! වැලිගම බීච් සන්සෙට් එකට සූදානම් වෙමින් සිටින්නේ! 🌅`,
          `ඉක්මනින් හමුවෙමු! අද රාත්‍රී පාටිය සුපිරියටම තියෙයි! 🎶`
        ] : [
          `Excited to see you tonight! 🥂 Should we meet at Botanik or Lotus Vista?`,
          `Sounds fantastic! Let's get a cocktail by the terrace. ✨`,
          `Ayubowan! Just getting ready for the Weligama beach sunset! 🌅`,
          `Can't wait! Sri Lankan nightlife is electric right now! 🎶`
        ];
        const randomReply = replyResponses[Math.floor(Math.random() * replyResponses.length)];
        onSendMessage(currentUser.id, randomReply);
      }, 3500);
    }
  };

  const handleSendSpecial = (type: 'party_invite' | 'cocktail_cheers') => {
    if (!selectedChatUser) return;
    if (type === 'party_invite') {
      onSendMessage(selectedChatUser.id, language === 'si' ? '🥂 අද රාත්‍රියේ Botanik හි පැවැත්වෙන Skyline Euphoria පාටියට ඔබට ආරාධනා කරන ලදී!' : '🥂 Invited you to Skyline Euphoria at Botanik tonight!', 'party_invite');
    } else {
      onSendMessage(selectedChatUser.id, language === 'si' ? '🍸 ඔබට විශේෂ Ceylon Arrack Sour කොක්ටේල් එකක් පිරිනමන ලදී!' : '🍸 Sent you a Ceylon Arrack Sour cheers cocktail!', 'cocktail_cheers');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl h-full bg-[#101016] border-l border-white/10 flex flex-col sm:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Conversations & Matches List */}
        <div className="w-full sm:w-72 border-r border-white/10 flex flex-col h-1/3 sm:h-full bg-[#0D0D12]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <span>{t.directMessages}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'si' ? 'සජීවී Supabase චැට් පද්ධතිය' : 'Real-time Supabase Chat'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white sm:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Incoming Love Requests */}
          {incomingRequests.length > 0 && (
            <div className="p-3 border-b border-white/10 bg-[#17121C]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF758F] mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{t.pendingLoveRequests} ({incomingRequests.length})</span>
              </p>
              <div className="space-y-2">
                {incomingRequests.map((req) => {
                  const fromUser = users.find(u => u.id === req.fromUserId);
                  if (!fromUser) return null;
                  return (
                    <div key={req.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <img src={fromUser.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-medium text-white truncate max-w-[90px]">{fromUser.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onRespondFriendRequest(req.id, 'accepted')}
                          className="p-1.5 rounded-lg bg-[#E63946] text-white hover:bg-[#D90429] cursor-pointer"
                          title="Accept"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRespondFriendRequest(req.id, 'declined')}
                          className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                          title="Decline"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {conversationUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <p>{language === 'si' ? 'සක්‍රීය චැට් කිසිවක් නැත.' : 'No active chats yet.'}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {language === 'si' ? 'සහකරුවන් සමග සම්බන්ධ වීමට ඩේටිං තට්ටුවේදී Like කරන්න!' : 'Swipe right in the Dating Stack to match with companions!'}
                </p>
              </div>
            ) : (
              conversationUsers.map((u) => {
                const isSelected = selectedChatUser?.id === u.id;
                const unreadMsgs = messages.filter(m => m.senderId === u.id && m.recipientId === currentUser.id && !m.isRead);
                const lastMsg = messages
                  .filter(m => (m.senderId === u.id && m.recipientId === currentUser.id) || (m.senderId === currentUser.id && m.recipientId === u.id))
                  .slice(-1)[0];

                return (
                  <button
                    key={u.id}
                    onClick={() => onSelectChatUser(u)}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isSelected ? 'bg-[#E63946]/15 border border-[#E63946]/40' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      {u.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D0D12]" />
                      )}
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate flex items-center gap-1">
                          <span>{u.name}</span>
                          {u.isVerified && <BadgeCheck className="w-3 h-3 text-sky-400 shrink-0" />}
                        </span>
                        {unreadMsgs.length > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#E63946] text-white text-[9px] font-bold flex items-center justify-center">
                            {unreadMsgs.length}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : `${SINHALA_CITIES[u.city]?.split(' ')[0] || u.city} • ${u.lookingFor}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="flex-1 flex flex-col h-2/3 sm:h-full bg-[#101016]">
          {selectedChatUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#14141B]">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onOpenProfile(selectedChatUser)}
                >
                  <img
                    src={selectedChatUser.avatarUrl}
                    alt={selectedChatUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{selectedChatUser.name}</span>
                      {selectedChatUser.isVerified && <BadgeCheck className="w-4 h-4 text-sky-400" />}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E63946]" />
                      <span>{SINHALA_CITIES[selectedChatUser.city] || selectedChatUser.city}</span>
                      {selectedChatUser.companionRate && (
                        <>
                          <span>·</span>
                          <span className="text-amber-300 font-medium">{selectedChatUser.companionRate}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                {currentMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <Heart className="w-8 h-8 text-[#FF758F]" />
                    <p className="text-sm font-semibold text-white">{t.startConversation}</p>
                    <p className="text-xs max-w-xs text-slate-400">
                      {t.startConversationDesc}
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-[#E63946] to-[#D90429] text-white rounded-br-none shadow-md shadow-[#E63946]/20'
                              : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                          }`}
                        >
                          {msg.text}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            msg.isRead ? (
                              <CheckCheck className="w-3 h-3 text-sky-400" />
                            ) : (
                              <Check className="w-3 h-3 text-slate-500" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src={selectedChatUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>{selectedChatUser.name} {language === 'si' ? 'ටයිප් කරමින් සිටී...' : 'is typing...'}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Bar */}
              <div className="px-4 py-2 border-t border-white/5 bg-[#121218] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                <button
                  onClick={() => handleSendSpecial('party_invite')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>{t.sendPartyInvite}</span>
                </button>

                <button
                  onClick={() => handleSendSpecial('cocktail_cheers')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Wine className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.sendCheers}</span>
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-[#14141B] border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={language === 'si' ? `${selectedChatUser.name} වෙත පණිවිඩයක් ලියන්න...` : `Message ${selectedChatUser.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-[#E63946] hover:bg-[#D90429] disabled:opacity-40 text-white shadow-md shadow-[#E63946]/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
                <Heart className="w-8 h-8 text-[#FF758F]" />
              </div>
              <h3 className="font-bold text-white text-base">{t.selectConversationTitle}</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                {t.selectConversationDesc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
