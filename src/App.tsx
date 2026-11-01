/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  PartyEvent, 
  CocktailItem, 
  ChatMessage, 
  LoveMatch, 
  FriendRequest, 
  ContentReport, 
  VendorPayment 
} from './types';
import { storage } from './services/storage';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CompanionCarousel } from './components/CompanionCarousel';
import { ProfileModal } from './components/ProfileModal';
import { DatingDeck } from './components/DatingDeck';
import { MatchModal } from './components/MatchModal';
import { EventsSection } from './components/EventsSection';
import { CocktailsSection } from './components/CocktailsSection';
import { ChatDrawer } from './components/ChatDrawer';
import { VendorPortal } from './components/VendorPortal';
import { AdminConsole } from './components/AdminConsole';
import { AuthModal } from './components/AuthModal';
import { SafetyModals, ReportModal } from './components/SafetyModals';
import { ProfileEditModal } from './components/ProfileEditModal';
import { Sparkles, Heart, Shield, MapPin } from 'lucide-react';

export default function App() {
  // Global synchronized states from storage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(storage.getCurrentUser());
  const [users, setUsers] = useState<UserProfile[]>(storage.getUsers());
  const [events, setEvents] = useState<PartyEvent[]>(storage.getEvents());
  const [cocktails, setCocktails] = useState<CocktailItem[]>(storage.getCocktails());
  const [messages, setMessages] = useState<ChatMessage[]>(storage.getMessages());
  const [matches, setMatches] = useState<LoveMatch[]>(storage.getMatches());
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(storage.getFriendRequests());
  const [savedEventIds, setSavedEventIds] = useState<string[]>(storage.getSavedEventIds());
  const [passedUserIds, setPassedUserIds] = useState<string[]>(storage.getPassedUserIds());
  const [reports, setReports] = useState<ContentReport[]>(storage.getReports());
  const [payments, setPayments] = useState<VendorPayment[]>(storage.getPayments());
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(storage.getBlockedUserIds());

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'discovery' | 'dating' | 'events' | 'cocktails' | 'vendor' | 'admin'>('discovery');
  const [discoveryCategoryFilter, setDiscoveryCategoryFilter] = useState<string>('all');

  // Modal visibility states
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [selectedProfileModal, setSelectedProfileModal] = useState<UserProfile | null>(null);
  const [matchedCelebrationUser, setMatchedCelebrationUser] = useState<UserProfile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  
  // Reporting state
  const [reportConfig, setReportConfig] = useState<{
    isOpen: boolean;
    targetType: 'profile' | 'event' | 'cocktail' | 'message';
    targetId: string;
    targetTitle: string;
  }>({
    isOpen: false,
    targetType: 'profile',
    targetId: '',
    targetTitle: '',
  });

  // Subscribe to persistent storage updates
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setCurrentUser(storage.getCurrentUser());
      setUsers(storage.getUsers());
      setEvents(storage.getEvents());
      setCocktails(storage.getCocktails());
      setMessages(storage.getMessages());
      setMatches(storage.getMatches());
      setFriendRequests(storage.getFriendRequests());
      setSavedEventIds(storage.getSavedEventIds());
      setPassedUserIds(storage.getPassedUserIds());
      setReports(storage.getReports());
      setPayments(storage.getPayments());
      setBlockedUserIds(storage.getBlockedUserIds());
    });
    return unsubscribe;
  }, []);

  // Guard: Never show admin on index/discovery or to non-admins
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role !== 'admin') {
      setActiveTab('discovery');
    }
  }, [activeTab, currentUser]);

  // Filter out blocked users from main directory
  const availableUsers = users.filter(u => !blockedUserIds.includes(u.id));
  const companionsList = availableUsers.filter(u => u.isCompanion || u.role === 'user');

  // Calculate unread chat messages for current user
  const unreadCount = currentUser 
    ? messages.filter(m => m.recipientId === currentUser.id && !m.isRead).length
    : 0;

  // Total attendees across all parties
  const totalAttendees = events.reduce((sum, e) => sum + e.attendeeIds.length, 0);

  // Handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
  };

  const handleLikeProfile = (profile: UserProfile) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    // Check if match
    storage.addMatch({
      id: `match_${Date.now()}`,
      user1Id: currentUser.id,
      user2Id: profile.id,
      createdAt: new Date().toISOString(),
    });
    setMatchedCelebrationUser(profile);
  };

  const handleSendLove = (profile: UserProfile) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    storage.sendFriendRequest(currentUser.id, profile.id);
  };

  const handleChatProfile = (profile: UserProfile) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    setSelectedChatUser(profile);
    setIsChatOpen(true);
    storage.markMessagesRead(currentUser.id, profile.id);
  };

  const handleSwipeRight = (profile: UserProfile) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    storage.addPassUser(profile.id);
    // 50% probability of instant mutual match or if companion
    if (profile.isCompanion || Math.random() > 0.4) {
      storage.addMatch({
        id: `match_${Date.now()}`,
        user1Id: currentUser.id,
        user2Id: profile.id,
        createdAt: new Date().toISOString(),
      });
      setMatchedCelebrationUser(profile);
    }
  };

  const handleSwipeLeft = (profile: UserProfile) => {
    storage.addPassUser(profile.id);
  };

  const handleSuperlike = (profile: UserProfile) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    storage.addPassUser(profile.id);
    storage.addMatch({
      id: `match_${Date.now()}`,
      user1Id: currentUser.id,
      user2Id: profile.id,
      isSuperLike: true,
      createdAt: new Date().toISOString(),
    });
    setMatchedCelebrationUser(profile);
  };

  const handleSendMessage = (recipientId: string, text: string, attachmentType?: 'party_invite' | 'cocktail_cheers') => {
    if (!currentUser) return;
    storage.sendMessage({
      senderId: currentUser.id,
      recipientId,
      text,
      attachmentType,
    });
  };

  const handleToggleRsvp = (eventId: string) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }
    storage.toggleRsvp(eventId, currentUser.id);
  };

  const handleToggleSave = (eventId: string) => {
    storage.toggleSaveEvent(eventId);
  };

  const handleBlockUser = (targetId: string, name: string) => {
    storage.blockUser(targetId);
    setSelectedProfileModal(null);
  };

  const handleReportTrigger = (targetType: 'profile' | 'event' | 'cocktail' | 'message', targetId: string, targetTitle: string) => {
    setReportConfig({
      isOpen: true,
      targetType,
      targetId,
      targetTitle,
    });
  };

  const handleSubmitReport = (reason: string, details: string) => {
    storage.submitReport({
      reporterId: currentUser?.id || 'guest',
      targetType: reportConfig.targetType,
      targetId: reportConfig.targetId,
      targetTitle: reportConfig.targetTitle,
      reason,
      details,
    });
  };

  const handleAccountDeletionRequest = (reason: string) => {
    if (!currentUser) return;
    storage.updateUser(currentUser.id, {
      deletionRequested: true,
      deletionReason: reason,
    });
  };

  const blockedProfiles = users.filter(u => blockedUserIds.includes(u.id));

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-slate-100 flex flex-col font-sans">
      {/* 1. TOP BAR CONTRACT */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setShowProfileEdit(true)}
        onOpenSafety={() => setShowSafetyModal(true)}
        onOpenChat={() => {
          if (!currentUser) {
            handleOpenAuth('login');
            return;
          }
          setIsChatOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* VIEW 1: DISCOVERY FEED */}
        {activeTab === 'discovery' && (
          <div>
            {/* Hero Spotlight Banner */}
            <HeroBanner
              featuredEvent={events[0] || {} as any}
              activeFilter={discoveryCategoryFilter}
              setActiveFilter={setDiscoveryCategoryFilter}
              onExploreRaves={() => setActiveTab('events')}
              onMeetCompanions={() => setActiveTab('dating')}
              totalAttendeesCount={totalAttendees}
            />

            {/* Carousel: Singles & Companions */}
            {(discoveryCategoryFilter === 'all' || discoveryCategoryFilter === 'companions') && (
              <CompanionCarousel
                companions={companionsList}
                onSelectProfile={(p) => setSelectedProfileModal(p)}
                onLikeProfile={handleLikeProfile}
                onChatProfile={handleChatProfile}
              />
            )}

            {/* Upcoming Parties & Raves */}
            {(discoveryCategoryFilter === 'all' || discoveryCategoryFilter === 'events') && (
              <EventsSection
                events={events}
                users={availableUsers}
                currentUser={currentUser}
                savedEventIds={savedEventIds}
                onToggleRsvp={handleToggleRsvp}
                onToggleSave={handleToggleSave}
                onRequireAuth={() => handleOpenAuth('register')}
                onSelectEventProfile={(p) => setSelectedProfileModal(p)}
              />
            )}

            {/* Signature Mixology & Tapas */}
            {(discoveryCategoryFilter === 'all' || discoveryCategoryFilter === 'cocktails') && (
              <CocktailsSection
                cocktails={cocktails}
                onReport={(type, id, title) => handleReportTrigger(type, id, title)}
              />
            )}
          </div>
        )}

        {/* VIEW 2: DATING STACK & GRID DISCOVERY */}
        {activeTab === 'dating' && (
          currentUser ? (
            <DatingDeck
              currentUser={currentUser}
              users={availableUsers}
              passedUserIds={passedUserIds}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
              onSuperlike={handleSuperlike}
              onResetDeck={() => storage.resetSwipes()}
              onSelectProfile={(p) => setSelectedProfileModal(p)}
            />
          ) : (
            <div className="my-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-[#14141B] border border-white/10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E63946]/10 flex items-center justify-center mx-auto text-[#FF758F]">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Join the Dating Stack</h2>
              <p className="text-xs text-slate-400">
                Log in or register to browse singles, swipe verified companion profiles, and match for tonight's parties.
              </p>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E63946] to-[#D90429] text-white font-bold text-xs shadow-lg shadow-[#E63946]/30"
              >
                Join Free Now
              </button>
            </div>
          )
        )}

        {/* VIEW 3: PARTIES & RAVES HUB */}
        {activeTab === 'events' && (
          <EventsSection
            events={events}
            users={availableUsers}
            currentUser={currentUser}
            savedEventIds={savedEventIds}
            onToggleRsvp={handleToggleRsvp}
            onToggleSave={handleToggleSave}
            onRequireAuth={() => handleOpenAuth('register')}
            onSelectEventProfile={(p) => setSelectedProfileModal(p)}
          />
        )}

        {/* VIEW 4: COCKTAILS & FOOD */}
        {activeTab === 'cocktails' && (
          <CocktailsSection
            cocktails={cocktails}
            onReport={(type, id, title) => handleReportTrigger(type, id, title)}
          />
        )}

        {/* VIEW 5: VENDOR & VENUE PORTAL */}
        {activeTab === 'vendor' && (
          currentUser ? (
            <VendorPortal
              currentUser={currentUser}
              events={events}
              cocktails={cocktails}
              onAddEvent={(e) => storage.addEvent(e)}
              onDeleteEvent={(id) => storage.deleteEvent(id)}
              onAddCocktail={(c) => storage.addCocktail(c)}
              onDeleteCocktail={(id) => storage.deleteCocktail(id)}
              onPayVendorPass={(orderId, gateway) => storage.recordVendorPayment(currentUser.id, orderId, gateway)}
              onSwitchToVendorRole={() => storage.updateUser(currentUser.id, { role: 'vendor' })}
            />
          ) : (
            <div className="my-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-[#14141B] border border-white/10 space-y-4">
              <h2 className="text-2xl font-extrabold text-white">Vendor Portal</h2>
              <p className="text-xs text-slate-400">
                Please log in to manage your club, rooftop bar, or rave event guestlists.
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-xs"
              >
                Log In as Vendor
              </button>
            </div>
          )
        )}

        {/* VIEW 6: SUPER ADMIN CENTRAL COMMAND (Only rendered for authenticated admin) */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminConsole
            currentUser={currentUser}
            users={users}
            events={events}
            cocktails={cocktails}
            reports={reports}
            payments={payments}
            onUpdateUser={(id, updates) => storage.updateUser(id, updates)}
            onDeleteUser={(id) => storage.deleteUser(id)}
            onDismissReport={(id) => storage.updateReportStatus(id, 'dismissed')}
            onResolveReport={(id) => storage.updateReportStatus(id, 'resolved')}
            onDeleteEvent={(id) => storage.deleteEvent(id)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-white/10 bg-[#0C0C10] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#E63946] to-[#FF758F] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Lovable LK</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400">Sri Lanka’s Premier Nightlife & Companion Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <button onClick={() => setShowSafetyModal(true)} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setShowSafetyModal(true)} className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <button onClick={() => setShowSafetyModal(true)} className="hover:text-white transition-colors">
              Zero-Tolerance UGC Safety
            </button>
            <button onClick={() => setShowSafetyModal(true)} className="hover:text-rose-400 transition-colors">
              GDPR Data Safety
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Lovable LK. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ALL INTERACTIVE MODALS & DRAWERS */}

      {/* Profile Detail Modal */}
      <ProfileModal
        profile={selectedProfileModal}
        onClose={() => setSelectedProfileModal(null)}
        onLike={handleLikeProfile}
        onSendLove={handleSendLove}
        onChat={handleChatProfile}
        onReport={(type, id, title) => handleReportTrigger(type, id, title)}
        onBlock={handleBlockUser}
        isFriendRequested={
          currentUser && selectedProfileModal
            ? friendRequests.some(r => r.fromUserId === currentUser.id && r.toUserId === selectedProfileModal.id)
            : false
        }
      />

      {/* Match Celebration Modal */}
      {currentUser && (
        <MatchModal
          currentUser={currentUser}
          matchedUser={matchedCelebrationUser}
          onClose={() => setMatchedCelebrationUser(null)}
          onStartChat={(matchedUser) => handleChatProfile(matchedUser)}
        />
      )}

      {/* Real-time Chat Drawer */}
      {currentUser && (
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          users={availableUsers}
          messages={messages}
          matches={matches}
          friendRequests={friendRequests}
          selectedChatUser={selectedChatUser}
          onSelectChatUser={(u) => {
            setSelectedChatUser(u);
            storage.markMessagesRead(currentUser.id, u.id);
          }}
          onSendMessage={handleSendMessage}
          onRespondFriendRequest={(reqId, status) => storage.respondFriendRequest(reqId, status)}
          onOpenProfile={(u) => setSelectedProfileModal(u)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authInitialMode}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => storage.setCurrentUser(user)}
        users={users}
        onRegisterUser={(newUser) => storage.addUser(newUser)}
      />

      {/* Profile Edit Modal */}
      {currentUser && (
        <ProfileEditModal
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          currentUser={currentUser}
          onSave={(updates) => storage.updateUser(currentUser.id, updates)}
        />
      )}

      {/* Trust, Safety & Compliance Modal */}
      <SafetyModals
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        currentUser={currentUser}
        blockedUsers={blockedProfiles}
        onUnblockUser={(userId) => storage.unblockUser(userId)}
        onRequestAccountDeletion={handleAccountDeletionRequest}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportConfig.isOpen}
        onClose={() => setReportConfig({ ...reportConfig, isOpen: false })}
        targetType={reportConfig.targetType}
        targetId={reportConfig.targetId}
        targetTitle={reportConfig.targetTitle}
        onSubmitReport={handleSubmitReport}
      />
    </div>
  );
}
