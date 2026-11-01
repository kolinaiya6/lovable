import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MessageSquare, Shield, Sparkles, Store, User, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: 'discovery' | 'dating' | 'events' | 'cocktails' | 'vendor' | 'admin';
  setActiveTab: (tab: 'discovery' | 'dating' | 'events' | 'cocktails' | 'vendor' | 'admin') => void;
  unreadCount: number;
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
  onOpenAuth,
  onOpenProfile,
  onOpenSafety,
  onOpenChat,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F14]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button 
          onClick={() => setActiveTab('discovery')}
          className="text-left group flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E63946] to-[#FF758F] flex items-center justify-center shadow-lg shadow-[#E63946]/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#FF758F] transition-colors">
              Lovable LK
            </span>
          </div>
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'discovery' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Discovery
          </button>
          
          <button
            onClick={() => setActiveTab('dating')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'dating' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Dating Stack
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'events' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Parties & Raves
          </button>

          <button
            onClick={() => setActiveTab('cocktails')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'cocktails' 
                ? 'text-[#FF758F] border-b-2 border-[#E63946] font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Cocktails & Tapas
          </button>

          <button
            onClick={onOpenChat}
            className="relative whitespace-nowrap text-slate-300 hover:text-white transition-colors py-1 flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-[#E63946] text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSafety}
            className="whitespace-nowrap text-slate-400 hover:text-slate-200 transition-colors py-1 flex items-center gap-1 text-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Safety & Trust</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200 focus:outline-none"
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
                    {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role}
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
                    <p className="text-slate-400 truncate text-[11px]">{currentUser.city} · Active Member</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E63946]/20 text-[#FF758F] font-medium uppercase tracking-wider">
                        {currentUser.role}
                      </span>
                      {currentUser.isCompanion && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                          ✨ Companion
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={onOpenProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Edit My Profile</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('vendor')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-white/5 rounded-lg text-left"
                    >
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>Vendor & Venue Portal</span>
                    </button>

                    {currentUser.email === 'kolinaiya6@gmail.com' && (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-left font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Central Command</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 mt-1 border-t border-white/5">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Leave Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#E63946] to-[#D90429] hover:from-[#D90429] hover:to-[#B5001D] rounded-xl shadow-lg shadow-[#E63946]/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Member Pass</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5 bg-[#0C0C10] text-[11px] font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`py-1 ${activeTab === 'discovery' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          Discovery
        </button>
        <button
          onClick={() => setActiveTab('dating')}
          className={`py-1 ${activeTab === 'dating' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          Dating
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-1 ${activeTab === 'events' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          Parties
        </button>
        <button
          onClick={() => setActiveTab('cocktails')}
          className={`py-1 ${activeTab === 'cocktails' ? 'text-[#FF758F] font-semibold' : ''}`}
        >
          Drinks
        </button>
        <button
          onClick={onOpenChat}
          className="relative py-1 flex items-center gap-1"
        >
          <span>Chat</span>
          {unreadCount > 0 && (
            <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};
