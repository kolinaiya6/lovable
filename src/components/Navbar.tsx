import React, { useState } from 'react';
import { UserProfile, PartyEvent } from '../types';
import { MessageSquare, Shield, Sparkles, Store, User, LogOut, ChevronDown, Globe } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: 'discovery' | 'dating' | 'events' | 'cocktails' | 'vendor' | 'admin';
  setActiveTab: (tab: 'discovery' | 'dating' | 'events' | 'cocktails' | 'vendor' | 'admin') => void;
  unreadCount: number;
  events?: PartyEvent[];
  onSelectEvent?: (event: PartyEvent) => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenSafety: () => void;
  onOpenChat: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  unreadCount,
  events = [],
  onSelectEvent,
  onOpenAuth,
  onOpenProfile,
  onOpenSafety,
  onOpenChat,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F14]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <button 
          onClick={() => setActiveTab('discovery')}
          className="text-left group flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E63946] to-[#FF758F] flex items-center justify-center shadow-lg shadow-[#E63946]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#FF758F] transition-colors">
              {t.brandName}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links in Sinhala */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'discovery' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.navDiscovery}
          </button>
          
          <button
            onClick={() => setActiveTab('dating')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'dating' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.navDating}
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'events' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.navEvents}
          </button>

          <button
            onClick={() => setActiveTab('cocktails')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'cocktails' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.navCocktails}
          </button>

          <button
            onClick={onOpenChat}
            className="relative whitespace-nowrap text-slate-300 hover:text-white transition-colors py-1 flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'si' ? 'පණිවිඩ' : 'Messages'}</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-[#E63946] text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSafety}
            className="whitespace-nowrap text-slate-400 hover:text-slate-200 transition-colors py-1 flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.navSafetyRules}</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Notification Center + Language Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle: Sinhala / English */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'si' ? 'en' : 'si')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="භාෂාව වෙනස් කරන්න / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF758F]" />
            <span>{language === 'si' ? 'සිංහල' : 'English'}</span>
          </button>

          {/* Automated 2-Hour Pre-Event Notification Radar */}
          <NotificationCenter
            currentUser={currentUser}
            events={events}
            onSelectEvent={onSelectEvent}
            onOpenAuth={onOpenAuth}
          />

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-white truncate max-w-[100px] leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'admin' ? t.navAdmin : currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-[#14141B] border border-white/10 shadow-2xl p-2 z-50 text-xs"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-slate-400 truncate text-[11px]">{currentUser.city} · {language === 'si' ? 'සක්‍රීය සාමාජික' : 'Active Member'}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E63946]/20 text-[#FF758F] font-medium uppercase tracking-wider">
                        {currentUser.role}
                      </span>
                      {currentUser.isCompanion && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                          ✨ {language === 'si' ? 'සහකරු' : 'Companion'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={onOpenProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t.navMyProfile}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('vendor')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg text-left cursor-pointer"
                    >
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>{t.navVendor}</span>
                    </button>

                    {currentUser.email === 'kolinaiya6@gmail.com' && (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-left font-medium cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{t.navAdmin}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 mt-1 border-t border-white/5">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.navLogout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                {t.navLogin}
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] hover:to-[#B5001D] rounded-xl shadow-lg shadow-[#E63946]/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.navRegister}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile subnav in Sinhala */}
      <div className="lg:hidden flex items-center justify-around py-2 border-t border-white/5 bg-[#0C0C10] text-[11px] font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`py-1 ${activeTab === 'discovery' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          {t.navDiscovery}
        </button>
        <button
          onClick={() => setActiveTab('dating')}
          className={`py-1 ${activeTab === 'dating' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          {t.navDating}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-1 ${activeTab === 'events' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          {t.navEvents}
        </button>
        <button
          onClick={() => setActiveTab('cocktails')}
          className={`py-1 ${activeTab === 'cocktails' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          {t.navCocktails}
        </button>
        <button
          onClick={onOpenChat}
          className="relative py-1 flex items-center gap-1"
        >
          <span>{language === 'si' ? 'චැට්' : 'Chat'}</span>
          {unreadCount > 0 && (
            <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};
