import React, { useState } from 'react';
import { UserProfile, PartyEvent, CocktailItem, ContentReport, VendorPayment } from '../types';
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
  UserX,
  X
} from 'lucide-react';
import { storage } from '../services/storage';

interface AdminConsoleProps {
  currentUser: UserProfile;
  users: UserProfile[];
  events: PartyEvent[];
  cocktails: CocktailItem[];
  reports: ContentReport[];
  payments: VendorPayment[];
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onDeleteUser: (id: string) => void;
  onDismissReport: (id: string) => void;
  onResolveReport: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  users,
  events,
  cocktails,
  reports,
  payments,
  onUpdateUser,
  onDeleteUser,
  onDismissReport,
  onResolveReport,
  onDeleteEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'moderation' | 'sql'>('metrics');
  const [userSearch, setUserSearch] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);

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
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.city.toLowerCase().includes(query);
  });

  const handleCopySQL = () => {
    const schema = storage.getSupabaseSQLSchema();
    navigator.clipboard?.writeText(schema);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  if (!isMasterAdmin) {
    return (
      <div className="my-12 p-8 rounded-3xl bg-[#14141B] border border-red-500/30 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="font-bold text-white text-lg">Super Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">
          This command center is reserved for platform administrators. Please log in with an administrator account to access master operations.
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
            Real-time platform supervision, user verification, content moderation & Supabase PostgreSQL infrastructure
          </p>
        </div>

        {/* Copy SQL Schema CTA */}
        <button
          onClick={handleCopySQL}
          className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Database className="w-4 h-4 text-[#FF758F]" />
          <span>{sqlCopied ? 'Schema Copied to Clipboard!' : 'Copy Supabase SQL'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'metrics'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Overview Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'moderation'
              ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Content Moderation ({pendingReportsCount})
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl transition-all ${
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

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing <strong className="text-white font-mono">{filteredUsers.length}</strong> registered accounts
            </span>
          </div>

          <div className="rounded-3xl bg-[#14141B] border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold">User</th>
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
                          <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{u.lookingFor || `${u.city} Member`}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300">{u.city}</td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateUser(u.id, { role: e.target.value as any })}
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white capitalize"
                        >
                          <option value="user">User</option>
                          <option value="vendor">Vendor</option>
                          <option value="admin">Admin</option>
                        </select>
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
                        {u.deletionRequested && (
                          <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded mr-2">
                            Deletion Requested
                          </span>
                        )}
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT MODERATION HUB */}
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
                  <p className="text-xs text-slate-300 mt-1 font-medium">Reason: {rep.reason}</p>
                  <p className="text-xs text-slate-400 mt-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    "{rep.details}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{new Date(rep.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDismissReport(rep.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => onResolveReport(rep.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Take Action</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE SQL VIEWER */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          {/* Supabase Connection Details Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#14141B] to-[#1A1A24] border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Connected Supabase Project
                </span>
                <h3 className="font-extrabold text-white text-lg mt-1">
                  https://gmtzbwgbgodrfzvmlimd.supabase.co
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://supabase.com/dashboard/project/gmtzbwgbgodrfzvmlimd/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
                >
                  <span>Open Supabase SQL Editor &rarr;</span>
                </a>
                <button
                  onClick={handleCopySQL}
                  className="py-2.5 px-4 rounded-xl bg-[#E63946] hover:bg-[#D90429] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#E63946]/30"
                >
                  <Copy className="w-4 h-4" />
                  <span>{sqlCopied ? 'SQL Copied!' : 'Copy Full App SQL'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div>
                <p className="font-semibold text-white mb-0.5">1. Copy Script</p>
                <p className="text-[11px] text-slate-400">Click the red "Copy Full App SQL" button to copy all 11 tables, triggers & initial seed data.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">2. Paste in Supabase</p>
                <p className="text-[11px] text-slate-400">Open your Supabase SQL editor and create a "New query", then paste the copied SQL.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-0.5">3. Run Query</p>
                <p className="text-[11px] text-slate-400">Press "Run". All tables, Row Level Security policies, and Realtime channels will activate instantly!</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-base">Full App PostgreSQL Production Schema</h4>
              <p className="text-xs text-slate-400">
                Includes Profiles, Events, RSVPs, Cocktails, Realtime Messages, Matches, Reports, and PayHere / PayPal Payments.
              </p>
            </div>
            <button
              onClick={handleCopySQL}
              className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{sqlCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-[#0A0A0D] border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
            {storage.getSupabaseSQLSchema()}
          </pre>
        </div>
      )}
    </div>
  );
};
