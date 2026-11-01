import React, { useState } from 'react';
import { 
  UserProfile, 
  PartyEvent, 
  CocktailItem, 
  ContentReport, 
  VendorPayment,
  UserRole,
  SriLankanCity,
  ALL_SRI_LANKAN_CITIES 
} from '../types';
import { 
  Shield, 
  Users, 
  Sparkles, 
  Store, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Search, 
  BadgeCheck, 
  Check, 
  Trash2, 
  Copy, 
  Database, 
  Edit3, 
  Plus, 
  X, 
  Upload, 
  Wine, 
  Lock, 
  MapPin, 
  Phone, 
  Clock, 
  Eye, 
  Flame 
} from 'lucide-react';
import { storage } from '../services/storage';
import { generateUUID } from '../utils/uuid';

interface AdminConsoleProps {
  currentUser: UserProfile;
  users: UserProfile[];
  events: PartyEvent[];
  cocktails: CocktailItem[];
  reports: ContentReport[];
  payments: VendorPayment[];
  onAddUser?: (user: UserProfile) => void;
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onDeleteUser: (id: string) => void;
  onAddEvent?: (event: PartyEvent) => void;
  onUpdateEvent?: (id: string, updates: Partial<PartyEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onAddCocktail?: (cocktail: CocktailItem) => void;
  onUpdateCocktail?: (id: string, updates: Partial<CocktailItem>) => void;
  onDeleteCocktail?: (id: string) => void;
  onDismissReport: (id: string) => void;
  onResolveReport: (id: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  users,
  events,
  cocktails,
  reports,
  payments,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddCocktail,
  onUpdateCocktail,
  onDeleteCocktail,
  onDismissReport,
  onResolveReport,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'parties' | 'cocktails' | 'moderation' | 'sql'>('metrics');
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [cocktailSearch, setCocktailSearch] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);

  // User CRUD modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    age: 24,
    city: 'Colombo' as SriLankanCity,
    bio: '',
    lookingFor: 'Party Companion & VIP Club Buddy',
    isCompanion: false,
    companionHeadline: '',
    companionRate: '',
    avatarUrl: '',
    isVerified: true,
  });

  // Event CRUD modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    venueName: '',
    city: 'Colombo' as SriLankanCity,
    address: 'Hospital Street, Colombo 01',
    category: 'VIP Rooftop' as PartyEvent['category'],
    dateStr: 'This Friday • 9:00 PM',
    timeStr: '21:00 - 04:00',
    entryPrice: 'Free Entry (Guestlist)',
    flyerUrl: '',
    description: '',
    phone: '+94 77 123 4567',
    isActiveTonight: true,
    isLiveDJ: true,
  });

  // Cocktail CRUD modal states
  const [showCocktailModal, setShowCocktailModal] = useState(false);
  const [editingCocktailId, setEditingCocktailId] = useState<string | null>(null);
  const [cocktailFormData, setCocktailFormData] = useState({
    name: '',
    venueName: '',
    city: 'Colombo' as SriLankanCity,
    priceLKR: 2800,
    description: '',
    ingredientsStr: 'Ceylon Coconut Arrack, Lime, Chili, Tonic',
    category: 'Signature Cocktail' as CocktailItem['category'],
    imageUrl: '',
  });

  // Verification that user is super-admin
  const isMasterAdmin = currentUser.email === 'kolinaiya6@gmail.com' || currentUser.role === 'admin';

  // Metrics
  const totalUsersCount = users.length;
  const activeCompanionsCount = users.filter(u => u.isCompanion).length;
  const registeredVenuesCount = users.filter(u => u.role === 'vendor').length;
  const liveEventsCount = events.length;
  const totalRevenueLKR = payments.reduce((acc, p) => acc + p.amountLKR, 0);
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const query = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.city.toLowerCase().includes(query) || u.role.toLowerCase().includes(query);
  });

  const filteredEvents = events.filter(e => {
    if (!eventSearch.trim()) return true;
    const query = eventSearch.toLowerCase();
    return e.title.toLowerCase().includes(query) || e.venueName.toLowerCase().includes(query) || e.city.toLowerCase().includes(query);
  });

  const filteredCocktails = cocktails.filter(c => {
    if (!cocktailSearch.trim()) return true;
    const query = cocktailSearch.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.venueName.toLowerCase().includes(query) || c.city.toLowerCase().includes(query);
  });

  const handleCopySQL = () => {
    const schema = storage.getSupabaseSQLSchema();
    navigator.clipboard?.writeText(schema);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  // User CRUD Handlers
  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      age: 24,
      city: 'Colombo',
      bio: '',
      lookingFor: 'Party Companion & VIP Club Buddy',
      isCompanion: false,
      companionHeadline: '',
      companionRate: '',
      avatarUrl: '',
      isVerified: true,
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUserId(user.id);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      age: user.age,
      city: user.city,
      bio: user.bio,
      lookingFor: user.lookingFor,
      isCompanion: user.isCompanion,
      companionHeadline: user.companionHeadline || '',
      companionRate: user.companionRate || '',
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) return;

    const finalAvatar = userFormData.avatarUrl.trim() || 
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    if (editingUserId) {
      onUpdateUser(editingUserId, {
        name: userFormData.name.trim(),
        email: userFormData.email.trim().toLowerCase(),
        password: userFormData.password || undefined,
        role: userFormData.role,
        age: Number(userFormData.age) || 24,
        city: userFormData.city,
        bio: userFormData.bio,
        lookingFor: userFormData.lookingFor,
        isCompanion: userFormData.isCompanion,
        companionHeadline: userFormData.isCompanion ? userFormData.companionHeadline : undefined,
        companionRate: userFormData.isCompanion ? userFormData.companionRate : undefined,
        avatarUrl: finalAvatar,
        photos: [finalAvatar],
        isVerified: userFormData.isVerified,
      });
    } else {
      const newUser: UserProfile = {
        id: generateUUID(),
        email: userFormData.email.trim().toLowerCase(),
        password: userFormData.password || 'Lovable@123456',
        name: userFormData.name.trim(),
        age: Number(userFormData.age) || 24,
        role: userFormData.role,
        isCompanion: userFormData.isCompanion,
        companionHeadline: userFormData.isCompanion ? userFormData.companionHeadline : undefined,
        companionRate: userFormData.isCompanion ? userFormData.companionRate : undefined,
        city: userFormData.city,
        distanceKm: 2.5,
        bio: userFormData.bio || `${userFormData.name} member profile on Lovable LK.`,
        lookingFor: userFormData.lookingFor,
        interests: ['VIP Lounges', 'Mixology', 'Techno', 'Sunset Raves'],
        avatarUrl: finalAvatar,
        photos: [finalAvatar],
        isVerified: userFormData.isVerified,
        isOnline: true,
        createdAt: new Date().toISOString(),
        trialEndsAt: userFormData.role === 'vendor' ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : undefined,
      };
      if (onAddUser) {
        onAddUser(newUser);
      } else {
        storage.addUser(newUser);
      }
    }
    setShowUserModal(false);
  };

  // Event CRUD Handlers
  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      venueName: 'Botanik Bistro & Rooftop',
      city: 'Colombo',
      address: 'Hospital Street, Colombo 01',
      category: 'VIP Rooftop',
      dateStr: 'This Friday • 9:00 PM',
      timeStr: '21:00 - 04:00',
      entryPrice: 'Free Entry (Guestlist)',
      flyerUrl: '',
      description: '',
      phone: '+94 77 123 4567',
      isActiveTonight: true,
      isLiveDJ: true,
    });
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (event: PartyEvent) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      venueName: event.venueName,
      city: event.city,
      address: event.address,
      category: event.category,
      dateStr: event.dateStr,
      timeStr: event.timeStr,
      entryPrice: event.entryPrice,
      flyerUrl: event.flyerUrl,
      description: event.description,
      phone: event.phone,
      isActiveTonight: event.isActiveTonight,
      isLiveDJ: event.isLiveDJ,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) return;

    const finalFlyer = eventFormData.flyerUrl.trim() || 
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80';

    if (editingEventId) {
      if (onUpdateEvent) {
        onUpdateEvent(editingEventId, {
          title: eventFormData.title,
          venueName: eventFormData.venueName,
          city: eventFormData.city,
          address: eventFormData.address,
          category: eventFormData.category,
          dateStr: eventFormData.dateStr,
          timeStr: eventFormData.timeStr,
          entryPrice: eventFormData.entryPrice,
          flyerUrl: finalFlyer,
          description: eventFormData.description,
          phone: eventFormData.phone,
          isActiveTonight: eventFormData.isActiveTonight,
          isLiveDJ: eventFormData.isLiveDJ,
        });
      } else {
        storage.updateEvent(editingEventId, {
          title: eventFormData.title,
          venueName: eventFormData.venueName,
          city: eventFormData.city,
          address: eventFormData.address,
          category: eventFormData.category,
          dateStr: eventFormData.dateStr,
          timeStr: eventFormData.timeStr,
          entryPrice: eventFormData.entryPrice,
          flyerUrl: finalFlyer,
          description: eventFormData.description,
          phone: eventFormData.phone,
          isActiveTonight: eventFormData.isActiveTonight,
          isLiveDJ: eventFormData.isLiveDJ,
        });
      }
    } else {
      const newEvt: PartyEvent = {
        id: generateUUID(),
        title: eventFormData.title,
        venueName: eventFormData.venueName,
        city: eventFormData.city,
        address: eventFormData.address,
        category: eventFormData.category,
        dateStr: eventFormData.dateStr,
        timeStr: eventFormData.timeStr,
        entryPrice: eventFormData.entryPrice,
        flyerUrl: finalFlyer,
        description: eventFormData.description || 'Curated nightlife party event in Sri Lanka.',
        attendeeIds: [currentUser.id],
        vendorId: currentUser.id,
        phone: eventFormData.phone,
        isActiveTonight: eventFormData.isActiveTonight,
        isLiveDJ: eventFormData.isLiveDJ,
      };
      if (onAddEvent) {
        onAddEvent(newEvt);
      } else {
        storage.addEvent(newEvt);
      }
    }
    setShowEventModal(false);
  };

  // Cocktail CRUD Handlers
  const handleOpenCreateCocktail = () => {
    setEditingCocktailId(null);
    setCocktailFormData({
      name: '',
      venueName: 'Botanik Bistro & Rooftop',
      city: 'Colombo',
      priceLKR: 2800,
      description: '',
      ingredientsStr: 'Ceylon Arrack, Fresh Lime, Kochchi Chili, Tonic',
      category: 'Signature Cocktail',
      imageUrl: '',
    });
    setShowCocktailModal(true);
  };

  const handleOpenEditCocktail = (cocktail: CocktailItem) => {
    setEditingCocktailId(cocktail.id);
    setCocktailFormData({
      name: cocktail.name,
      venueName: cocktail.venueName,
      city: cocktail.city,
      priceLKR: cocktail.priceLKR,
      description: cocktail.description,
      ingredientsStr: cocktail.ingredients.join(', '),
      category: cocktail.category,
      imageUrl: cocktail.imageUrl,
    });
    setShowCocktailModal(true);
  };

  const handleSaveCocktail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cocktailFormData.name.trim()) return;

    const finalImage = cocktailFormData.imageUrl.trim() || 
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80';

    if (editingCocktailId) {
      if (onUpdateCocktail) {
        onUpdateCocktail(editingCocktailId, {
          name: cocktailFormData.name,
          venueName: cocktailFormData.venueName,
          city: cocktailFormData.city,
          priceLKR: Number(cocktailFormData.priceLKR) || 2500,
          description: cocktailFormData.description,
          ingredients: cocktailFormData.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
          category: cocktailFormData.category,
          imageUrl: finalImage,
        });
      } else {
        storage.updateCocktail(editingCocktailId, {
          name: cocktailFormData.name,
          venueName: cocktailFormData.venueName,
          city: cocktailFormData.city,
          priceLKR: Number(cocktailFormData.priceLKR) || 2500,
          description: cocktailFormData.description,
          ingredients: cocktailFormData.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
          category: cocktailFormData.category,
          imageUrl: finalImage,
        });
      }
    } else {
      const newCocktail: CocktailItem = {
        id: generateUUID(),
        name: cocktailFormData.name,
        venueName: cocktailFormData.venueName,
        city: cocktailFormData.city,
        priceLKR: Number(cocktailFormData.priceLKR) || 2500,
        description: cocktailFormData.description || 'Handcrafted cocktail mixology special.',
        ingredients: cocktailFormData.ingredientsStr.split(',').map(s => s.trim()).filter(Boolean),
        category: cocktailFormData.category,
        imageUrl: finalImage,
        vendorId: currentUser.id,
      };
      if (onAddCocktail) {
        onAddCocktail(newCocktail);
      } else {
        storage.addCocktail(newCocktail);
      }
    }
    setShowCocktailModal(false);
  };

  if (!isMasterAdmin) {
    return (
      <div className="my-12 p-8 rounded-3xl bg-[#14141B] border border-red-500/30 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="font-bold text-white text-lg">Super Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">
          This command center is reserved for platform administrators. Please log in with kolinaiya6@gmail.com to access master operations.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Super-Admin Central Command</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Lovable LK Master Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Full user CRUD management, party guestlists, signature cocktails & Supabase PostgreSQL infrastructure
          </p>
        </div>

        {/* Copy SQL Schema CTA */}
        <button
          onClick={handleCopySQL}
          className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Database className="w-4 h-4 text-[#FF758F]" />
          <span>{sqlCopied ? 'Schema Copied to Clipboard!' : 'Copy Supabase SQL'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Overview Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users CRUD ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'parties'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Parties & Events ({events.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('cocktails')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'cocktails'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Wine className="w-3.5 h-3.5" />
          <span>Cocktails & Tapas ({cocktails.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'moderation'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Content Moderation ({pendingReportsCount})
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'sql'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Database SQL Viewer
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-[#14141B] border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase">Total Users</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono tabular-nums">{totalUsersCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">Partygoers & Singles</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141B] border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase">Companions</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-300 font-mono tabular-nums">{activeCompanionsCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">Verified VIP Hosts</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141B] border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase">Venues</span>
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono tabular-nums">{registeredVenuesCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">Clubs & Lounges</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141B] border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase">Live Events</span>
                <Calendar className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-extrabold text-white font-mono tabular-nums">{liveEventsCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">Active Guestlists</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141B] border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
                LKR {totalRevenueLKR.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">PayHere & PayPal Passes</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141B] border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase">Pending Reports</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-300 font-mono tabular-nums">{pendingReportsCount}</p>
              <p className="text-[10px] text-slate-500 mt-1">UGC Moderation Queue</p>
            </div>
          </div>

          {/* Recent Payments Stream */}
          <div className="p-6 rounded-3xl bg-[#14141B] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">PayHere & PayPal Vendor Transaction Ledger</h3>
                <p className="text-xs text-slate-400">Recorded vendor subscriptions for monthly platform passes</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                LKR 5,000 / pass
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-semibold">Gateway</th>
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Vendor ID</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.paymentGateway === 'PAYHERE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#FFC439]/20 text-[#FFC439] border border-[#FFC439]/30'
                        }`}>
                          {p.paymentGateway || 'PAYHERE'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 font-semibold">{p.gatewayOrderId}</td>
                      <td className="py-3 text-slate-400">{p.vendorId}</td>
                      <td className="py-3 text-emerald-400 font-bold">LKR {p.amountLKR.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{new Date(p.validUntil).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (FULL CRUD) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name, email, or city..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                <strong className="text-white font-mono">{filteredUsers.length}</strong> Users
              </span>
              <button
                onClick={handleOpenCreateUser}
                className="py-2.5 px-4 rounded-xl bg-[#E63946] hover:bg-[#D90429] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#E63946]/20 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create New User</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-[#14141B] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">User Profile</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">City</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Verified</th>
                    <th className="p-4 font-semibold">Companion</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{u.lookingFor || `${u.city} Member`}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-mono text-[11px]">{u.email}</td>

                      <td className="p-4 text-slate-300">{u.city}</td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : u.role === 'vendor'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => onUpdateUser(u.id, { isVerified: !u.isVerified })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            u.isVerified 
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' 
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {u.isVerified ? 'Verified ✓' : 'Unverified'}
                        </button>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => onUpdateUser(u.id, { isCompanion: !u.isCompanion })}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            u.isCompanion 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {u.isCompanion ? '✨ Companion' : 'No'}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit User Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARTIES & EVENTS CRUD */}
      {activeTab === 'parties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search event title, venue, or city..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <button
              onClick={handleOpenCreateEvent}
              className="py-2.5 px-4 rounded-xl bg-[#E63946] hover:bg-[#D90429] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#E63946]/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Party Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="rounded-3xl bg-[#14141B] border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={evt.flyerUrl} 
                      alt={evt.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/60" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                        {evt.category}
                      </span>
                      {evt.isActiveTonight && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 text-[10px] font-bold text-white flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Tonight
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#E63946] text-[10px] font-extrabold text-white">
                        {evt.entryPrice}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-extrabold text-base text-white">{evt.title}</h4>
                    <p className="text-xs text-[#FF758F] font-semibold">{evt.venueName} • {evt.city}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                    <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{evt.dateStr} ({evt.timeStr})</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {evt.attendeeIds.length} Guest RSVPs
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditEvent(evt)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                      title="Edit Event"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COCKTAILS & TAPAS CRUD */}
      {activeTab === 'cocktails' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search cocktail name, venue, or ingredients..."
                value={cocktailSearch}
                onChange={(e) => setCocktailSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <button
              onClick={handleOpenCreateCocktail}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cocktail / Tapas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCocktails.map((c) => (
              <div
                key={c.id}
                className="rounded-3xl bg-[#14141B] border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={c.imageUrl} 
                      alt={c.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/60" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      {c.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-extrabold text-black font-mono">
                      LKR {c.priceLKR.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-extrabold text-base text-white">{c.name}</h4>
                    <p className="text-xs text-amber-300 font-semibold">{c.venueName} • {c.city}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                    <div className="pt-1 flex flex-wrap gap-1">
                      {c.ingredients.map((ing, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => handleOpenEditCocktail(c)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCocktail ? onDeleteCocktail(c.id) : storage.deleteCocktail(c.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTENT MODERATION HUB */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <strong>Zero-Tolerance UGC Safety Engine:</strong> All reported profiles, parties, and cocktails must be reviewed or purged promptly to preserve member trust.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-[#14141B] border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-400 uppercase tracking-wider">
                      Report: {rep.targetType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      rep.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-2">{rep.targetTitle}</h4>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">Reason: {rep.reason}</p>
                  {rep.details && <p className="text-xs text-slate-400 mt-1 italic">"{rep.details}"</p>}
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => onDismissReport(rep.id)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => onResolveReport(rep.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold"
                    >
                      Resolve & Moderate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DATABASE SQL VIEWER */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Production Supabase PostgreSQL Schema</h3>
              <p className="text-xs text-slate-400">Complete SQL schema with Auth triggers, RLS policies, Realtime publication, and storage buckets</p>
            </div>
            <button
              onClick={handleCopySQL}
              className="py-2 px-3.5 rounded-xl bg-[#E63946] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{sqlCopied ? 'Copied!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-black border border-white/10 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[500px] no-scrollbar">
            {storage.getSupabaseSQLSchema()}
          </pre>
        </div>
      )}

      {/* MODAL: USER CREATE / EDIT */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form
            onSubmit={handleSaveUser}
            className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white">
                {editingUserId ? 'Edit User Profile' : 'Create New User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@lovable.lk"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  placeholder={editingUserId ? 'Leave blank to preserve' : 'Min 6 characters'}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white capitalize"
                >
                  <option value="user">User / Partygoer</option>
                  <option value="vendor">Vendor / Club Organizer</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="90"
                  value={userFormData.age}
                  onChange={(e) => setUserFormData({ ...userFormData, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">City / Region</label>
                <select
                  value={userFormData.city}
                  onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value as SriLankanCity })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  {ALL_SRI_LANKAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Avatar Upload / URL */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>Avatar Photo</span>
                {userFormData.avatarUrl && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Photo Attached
                  </span>
                )}
              </label>

              {userFormData.avatarUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
                  <img src={userFormData.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-[#E63946]" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px]">Profile Image Attached</p>
                    <button
                      type="button"
                      onClick={() => setUserFormData({ ...userFormData, avatarUrl: '' })}
                      className="text-[10px] text-red-400 hover:underline mt-0.5"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full cursor-pointer p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center gap-2 text-center transition-all group mb-2">
                  <Upload className="w-4 h-4 text-[#FF758F]" />
                  <span className="text-xs text-slate-300 group-hover:text-white">Upload avatar photo from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setUserFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}

              <input
                type="url"
                placeholder="Or paste direct image URL..."
                value={userFormData.avatarUrl.startsWith('data:') ? '' : userFormData.avatarUrl}
                onChange={(e) => setUserFormData({ ...userFormData, avatarUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs"
              />
            </div>

            {/* Companion Toggle */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userFormData.isCompanion}
                  onChange={(e) => setUserFormData({ ...userFormData, isCompanion: e.target.checked })}
                  className="accent-[#E63946]"
                />
                <span className="font-semibold text-white">Verified Nightlife Companion Badge</span>
              </label>

              {userFormData.isCompanion && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Headline (e.g. VIP Rooftop Escort)"
                    value={userFormData.companionHeadline}
                    onChange={(e) => setUserFormData({ ...userFormData, companionHeadline: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Rate (e.g. LKR 15,000 / event)"
                    value={userFormData.companionRate}
                    onChange={(e) => setUserFormData({ ...userFormData, companionRate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-[11px]"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Bio</label>
              <textarea
                rows={2}
                placeholder="Brief profile summary..."
                value={userFormData.bio}
                onChange={(e) => setUserFormData({ ...userFormData, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={userFormData.isVerified}
                  onChange={(e) => setUserFormData({ ...userFormData, isVerified: e.target.checked })}
                  className="accent-sky-500"
                />
                <span>Grant Verified Account Badge (Blue Checkmark)</span>
              </label>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E63946] text-white font-bold shadow-md shadow-[#E63946]/30"
              >
                {editingUserId ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PARTY EVENT CREATE / EDIT */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form
            onSubmit={handleSaveEvent}
            className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white">
                {editingEventId ? 'Edit Party Event' : 'Create New Party Event'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Skyline Lotus Vista Rooftop Sessions"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Botanik Bistro"
                  value={eventFormData.venueName}
                  onChange={(e) => setEventFormData({ ...eventFormData, venueName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">City</label>
                <select
                  value={eventFormData.city}
                  onChange={(e) => setEventFormData({ ...eventFormData, city: e.target.value as SriLankanCity })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  {ALL_SRI_LANKAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={eventFormData.category}
                  onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  <option value="VIP Rooftop">VIP Rooftop</option>
                  <option value="Beach Party">Beach Party</option>
                  <option value="Techno Rave">Techno Rave</option>
                  <option value="Ladies Night">Ladies Night</option>
                  <option value="Sunset Lounge">Sunset Lounge</option>
                  <option value="Live Band">Live Band</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Entry Price / Pass</label>
                <input
                  type="text"
                  placeholder="Free Entry (Guestlist)"
                  value={eventFormData.entryPrice}
                  onChange={(e) => setEventFormData({ ...eventFormData, entryPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Date String</label>
                <input
                  type="text"
                  placeholder="Saturday • 8:00 PM"
                  value={eventFormData.dateStr}
                  onChange={(e) => setEventFormData({ ...eventFormData, dateStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Timing</label>
                <input
                  type="text"
                  placeholder="21:00 - 04:00"
                  value={eventFormData.timeStr}
                  onChange={(e) => setEventFormData({ ...eventFormData, timeStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
            </div>

            {/* Party Flyer Upload (No Sample Images) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#FF758F]" />
                  <span>Party Event Flyer</span>
                </span>
                {eventFormData.flyerUrl && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Flyer Attached
                  </span>
                )}
              </label>

              {eventFormData.flyerUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 mb-2.5 group">
                  <img src={eventFormData.flyerUrl} alt="" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-3">
                    <span className="text-xs font-semibold text-white">Flyer image ready</span>
                    <button
                      type="button"
                      onClick={() => setEventFormData({ ...eventFormData, flyerUrl: '' })}
                      className="p-1.5 rounded-lg bg-red-500 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full cursor-pointer p-4 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-center transition-all mb-2">
                  <Upload className="w-5 h-5 text-[#FF758F]" />
                  <span className="text-xs font-bold text-white">Upload flyer from device</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setEventFormData(prev => ({ ...prev, flyerUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}

              <input
                type="url"
                placeholder="Or paste direct flyer image URL..."
                value={eventFormData.flyerUrl.startsWith('data:') ? '' : eventFormData.flyerUrl}
                onChange={(e) => setEventFormData({ ...eventFormData, flyerUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Event vibe details..."
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={eventFormData.isActiveTonight}
                  onChange={(e) => setEventFormData({ ...eventFormData, isActiveTonight: e.target.checked })}
                  className="accent-[#E63946]"
                />
                <span>Active Tonight</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={eventFormData.isLiveDJ}
                  onChange={(e) => setEventFormData({ ...eventFormData, isLiveDJ: e.target.checked })}
                  className="accent-[#E63946]"
                />
                <span>Live DJ Performing</span>
              </label>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E63946] text-white font-bold shadow-md shadow-[#E63946]/30"
              >
                {editingEventId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: COCKTAIL CREATE / EDIT */}
      {showCocktailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form
            onSubmit={handleSaveCocktail}
            className="relative w-full max-w-lg bg-[#14141B] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white">
                {editingCocktailId ? 'Edit Cocktail / Dish' : 'Create Cocktail / Tapas'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCocktailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Item Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ceylon Passion Arrack Sour"
                value={cocktailFormData.name}
                onChange={(e) => setCocktailFormData({ ...cocktailFormData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Botanik Bistro"
                  value={cocktailFormData.venueName}
                  onChange={(e) => setCocktailFormData({ ...cocktailFormData, venueName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">City</label>
                <select
                  value={cocktailFormData.city}
                  onChange={(e) => setCocktailFormData({ ...cocktailFormData, city: e.target.value as SriLankanCity })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  {ALL_SRI_LANKAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={cocktailFormData.category}
                  onChange={(e) => setCocktailFormData({ ...cocktailFormData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1C26] border border-white/10 text-white"
                >
                  <option value="Signature Cocktail">Signature Cocktail</option>
                  <option value="Tapas & Bites">Tapas & Bites</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Mocktail">Mocktail</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Price (LKR)</label>
                <input
                  type="number"
                  required
                  placeholder="2800"
                  value={cocktailFormData.priceLKR}
                  onChange={(e) => setCocktailFormData({ ...cocktailFormData, priceLKR: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ingredients (comma separated)</label>
              <input
                type="text"
                placeholder="Arrack, Passionfruit, Cinnamon, Lime"
                value={cocktailFormData.ingredientsStr}
                onChange={(e) => setCocktailFormData({ ...cocktailFormData, ingredientsStr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            {/* Photo Upload (No Sample Images) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Item Photo</span>
                </span>
                {cocktailFormData.imageUrl && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Photo Attached
                  </span>
                )}
              </label>

              {cocktailFormData.imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 mb-2.5 group">
                  <img src={cocktailFormData.imageUrl} alt="" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-3">
                    <span className="text-xs font-semibold text-white">Drink photo ready</span>
                    <button
                      type="button"
                      onClick={() => setCocktailFormData({ ...cocktailFormData, imageUrl: '' })}
                      className="p-1.5 rounded-lg bg-red-500 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full cursor-pointer p-4 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-center transition-all mb-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">Upload drink photo from device</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setCocktailFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}

              <input
                type="url"
                placeholder="Or paste direct image URL..."
                value={cocktailFormData.imageUrl.startsWith('data:') ? '' : cocktailFormData.imageUrl}
                onChange={(e) => setCocktailFormData({ ...cocktailFormData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Flavor notes and mixology details..."
                value={cocktailFormData.description}
                onChange={(e) => setCocktailFormData({ ...cocktailFormData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCocktailModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-black font-bold shadow-md"
              >
                {editingCocktailId ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
