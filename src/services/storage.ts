import { 
  UserProfile, 
  PartyEvent, 
  CocktailItem, 
  ChatMessage, 
  LoveMatch, 
  FriendRequest, 
  ContentReport, 
  VendorPayment,
  SriLankanCity 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_EVENTS, 
  INITIAL_COCKTAILS, 
  INITIAL_REPORTS, 
  INITIAL_PAYMENTS 
} from '../data/mockData';
import { supabase, FULL_SUPABASE_SQL } from './supabase';
import { generateUUID } from '../utils/uuid';

const STORAGE_KEYS = {
  CURRENT_USER: 'lovable_lk_current_user',
  USERS: 'lovable_lk_users',
  EVENTS: 'lovable_lk_events',
  COCKTAILS: 'lovable_lk_cocktails',
  MESSAGES: 'lovable_lk_messages',
  MATCHES: 'lovable_lk_matches',
  FRIEND_REQUESTS: 'lovable_lk_friend_requests',
  SAVED_EVENTS: 'lovable_lk_saved_events',
  REPORTS: 'lovable_lk_reports',
  PAYMENTS: 'lovable_lk_payments',
  BLOCKED_USERS: 'lovable_lk_blocked_users',
  PASSES: 'lovable_lk_swipes_passed',
};

// -------------------------------------------------------------
// Data Converters between Frontend (camelCase) & Supabase (snake_case)
// -------------------------------------------------------------

function dbProfileToUser(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    password: row.password_hash || undefined,
    name: row.name || 'Member',
    age: row.age || 24,
    role: row.role || 'user',
    isCompanion: Boolean(row.is_companion),
    companionHeadline: row.companion_headline || undefined,
    companionRate: row.companion_rate || undefined,
    city: (row.city || 'Colombo') as SriLankanCity,
    distanceKm: Number(row.distance_km) || 2.5,
    bio: row.bio || '',
    lookingFor: row.looking_for || 'Casual Dating & Dance Partner',
    interests: Array.isArray(row.interests) ? row.interests : ['VIP Lounges', 'Mixology', 'Techno'],
    avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    photos: Array.isArray(row.photos) && row.photos.length > 0 ? row.photos : [row.avatar_url],
    isVerified: Boolean(row.is_verified),
    isOnline: Boolean(row.is_online),
    instagram: row.instagram || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    trialEndsAt: row.trial_ends_at || undefined,
    deletionRequested: Boolean(row.deletion_requested),
    deletionReason: row.deletion_reason || undefined,
  };
}

function userToDbProfile(user: UserProfile) {
  return {
    id: user.id,
    email: user.email.toLowerCase().trim(),
    password_hash: user.password || null,
    name: user.name,
    age: user.age,
    role: user.role,
    is_companion: user.isCompanion,
    companion_headline: user.companionHeadline || null,
    companion_rate: user.companionRate || null,
    city: user.city,
    distance_km: user.distanceKm,
    bio: user.bio,
    looking_for: user.lookingFor,
    interests: user.interests,
    avatar_url: user.avatarUrl,
    photos: user.photos,
    is_verified: user.isVerified,
    is_online: user.isOnline,
    instagram: user.instagram || null,
    trial_ends_at: user.trialEndsAt || null,
    deletion_requested: user.deletionRequested || false,
    deletion_reason: user.deletionReason || null,
    updated_at: new Date().toISOString(),
  };
}

function dbEventToParty(row: any): PartyEvent {
  return {
    id: row.id,
    title: row.title,
    venueName: row.venue_name,
    city: (row.city || 'Colombo') as SriLankanCity,
    address: row.address,
    category: row.category || 'Beach Party',
    dateStr: row.date_str,
    timeStr: row.time_str,
    entryPrice: row.entry_price || 'Free Entry',
    flyerUrl: row.flyer_url,
    description: row.description || '',
    djLineup: Array.isArray(row.dj_lineup) ? row.dj_lineup : [],
    attendeeIds: Array.isArray(row.attendee_ids) ? row.attendee_ids : [],
    vendorId: row.vendor_id || '',
    phone: row.phone || '',
    isActiveTonight: Boolean(row.is_active_tonight),
    isLiveDJ: Boolean(row.is_live_dj),
  };
}

function partyToDbEvent(event: PartyEvent) {
  return {
    id: event.id,
    title: event.title,
    venue_name: event.venueName,
    city: event.city,
    address: event.address,
    category: event.category,
    date_str: event.dateStr,
    time_str: event.timeStr,
    entry_price: event.entryPrice,
    flyer_url: event.flyerUrl,
    description: event.description,
    dj_lineup: event.djLineup || [],
    attendee_ids: event.attendeeIds || [],
    vendor_id: event.vendorId || null,
    phone: event.phone || null,
    is_active_tonight: event.isActiveTonight,
    is_live_dj: event.isLiveDJ,
  };
}

function dbCocktailToItem(row: any): CocktailItem {
  return {
    id: row.id,
    name: row.name,
    venueName: row.venue_name,
    city: (row.city || 'Colombo') as SriLankanCity,
    priceLKR: Number(row.price_lkr) || 2500,
    description: row.description || '',
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    category: row.category || 'Signature Cocktail',
    imageUrl: row.image_url,
    vendorId: row.vendor_id || '',
  };
}

function cocktailToDbItem(item: CocktailItem) {
  return {
    id: item.id,
    name: item.name,
    venue_name: item.venueName,
    city: item.city,
    price_lkr: item.priceLKR,
    description: item.description,
    ingredients: item.ingredients || [],
    category: item.category,
    image_url: item.imageUrl,
    vendor_id: item.vendorId || null,
  };
}

function dbMessageToChat(row: any): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    text: row.text,
    timestamp: row.created_at,
    isRead: Boolean(row.is_read),
    attachmentType: row.attachment_type || undefined,
    attachmentData: row.attachment_data || undefined,
  };
}

function chatToDbMessage(msg: ChatMessage) {
  return {
    id: msg.id,
    sender_id: msg.senderId,
    recipient_id: msg.recipientId,
    text: msg.text,
    attachment_type: msg.attachmentType || null,
    attachment_data: msg.attachmentData || null,
    is_read: msg.isRead,
    created_at: msg.timestamp || new Date().toISOString(),
  };
}

class StorageService {
  private listeners: Set<() => void> = new Set();
  private isSupabaseSyncing = false;

  constructor() {
    this.initDefaults();
    this.initSupabaseSync();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COCKTAILS)) {
      localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(INITIAL_COCKTAILS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    }

    // Clean visitor state: never auto-login as admin on site visit
    try {
      const existingUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (existingUserStr) {
        const parsed = JSON.parse(existingUserStr);
        if (parsed?.email === 'kolinaiya6@gmail.com' && !sessionStorage.getItem('lovable_admin_verified')) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      const sampleMessages: ChatMessage[] = [
        {
          id: generateUUID(),
          senderId: 'b2222222-2222-2222-2222-222222222222',
          recipientId: 'a1111111-1111-1111-1111-111111111111',
          text: 'Ayubowan! Are you attending the Lotus Vista session at Botanik tonight? 🥂',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
        },
        {
          id: generateUUID(),
          senderId: 'a1111111-1111-1111-1111-111111111111',
          recipientId: 'b2222222-2222-2222-2222-222222222222',
          text: 'Hey Senuri! Yes, reserved a VIP table on the terrace. Let’s connect over cocktails! ✨',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: true,
        }
      ];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(sampleMessages));
    }
  }

  /**
   * Safe asynchronous dispatcher for Supabase mutations that guarantees non-blocking execution
   * and clean error reporting without throwing unhandled promise rejections.
   */
  private fireSupabase(operation: () => Promise<any> | PromiseLike<any>) {
    (async () => {
      try {
        const res = await operation();
        if (res && res.error) {
          console.warn('Supabase notice:', res.error.message || res.error);
        }
      } catch (err) {
        console.warn('Supabase network notice:', err);
      }
    })();
  }

  /**
   * Initializes bidirectional Supabase live synchronization:
   * 1. Pulls initial live rows from Supabase (profiles, events, cocktails, messages)
   * 2. Subscribes to Supabase Realtime channel for live multi-user updates
   */
  public async initSupabaseSync() {
    if (this.isSupabaseSyncing) return;
    this.isSupabaseSyncing = true;

    try {
      // 1. Fetch live profiles from Supabase
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pErr && profiles && profiles.length > 0) {
        const mappedUsers = profiles.map(dbProfileToUser);
        const localUsers = this.getUsers();
        const merged = mappedUsers.map(u => {
          const local = localUsers.find(l => l.id === u.id || l.email.toLowerCase() === u.email.toLowerCase());
          return {
            ...u,
            password: local?.password || u.password,
          };
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
      }

      // 2. Fetch live events from Supabase
      const { data: events, error: eErr } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!eErr && events && events.length > 0) {
        const mappedEvents = events.map(dbEventToParty);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mappedEvents));
      }

      // 3. Fetch live cocktails from Supabase
      const { data: cocktails, error: cErr } = await supabase
        .from('cocktails')
        .select('*')
        .order('created_at', { ascending: false });

      if (!cErr && cocktails && cocktails.length > 0) {
        const mappedCocktails = cocktails.map(dbCocktailToItem);
        localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(mappedCocktails));
      }

      // 4. Fetch live messages from Supabase
      const { data: messages, error: mErr } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!mErr && messages && messages.length > 0) {
        const mappedMessages = messages.map(dbMessageToChat);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(mappedMessages));
      }

      // 5. Fetch live reports from Supabase
      const { data: reports, error: rErr } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!rErr && reports && reports.length > 0) {
        const mappedReports: ContentReport[] = reports.map((r: any) => ({
          id: r.id,
          reporterId: r.reporter_id,
          targetType: r.target_type,
          targetId: r.target_id,
          targetTitle: r.target_title,
          reason: r.reason,
          details: r.details || '',
          status: r.status,
          createdAt: r.created_at,
        }));
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(mappedReports));
      }

      // 6. Fetch live payments from Supabase
      const { data: payments, error: payErr } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!payErr && payments && payments.length > 0) {
        const mappedPayments: VendorPayment[] = payments.map((p: any) => ({
          id: p.id,
          vendorId: p.vendor_id,
          amountLKR: Number(p.amount_lkr),
          plan: p.plan,
          paymentGateway: p.payment_gateway,
          gatewayOrderId: p.gateway_order_id,
          status: p.status,
          createdAt: p.created_at,
          validUntil: p.valid_until,
        }));
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mappedPayments));
      }

      // Notify UI listeners of freshly synchronized live database state
      this.notify();

      // Listen for realtime postgres_changes on all public tables
      try {
        supabase
          .channel('lovable_live_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
            const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
            if (data) {
              localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.map(dbEventToParty)));
              this.notify();
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (data) {
              const localUsers = this.getUsers();
              const mapped = data.map(dbProfileToUser).map(u => {
                const local = localUsers.find(l => l.id === u.id);
                return { ...u, password: local?.password || u.password };
              });
              localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mapped));
              this.notify();
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'cocktails' }, async () => {
            const { data } = await supabase.from('cocktails').select('*').order('created_at', { ascending: false });
            if (data) {
              localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(data.map(dbCocktailToItem)));
              this.notify();
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
            const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
            if (data) {
              localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.map(dbMessageToChat)));
              this.notify();
            }
          })
          .subscribe();
      } catch (rtErr) {
        console.warn('Supabase realtime listener subscription notice:', rtErr);
      }
    } catch (err) {
      console.warn('Initial Supabase synchronization status:', err);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // Current User
  public getCurrentUser(): UserProfile | null {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.updateUser(user.id, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  // Users
  public getUsers(): UserProfile[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.USERS);
      return val ? JSON.parse(val) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public authenticateUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'No account registered with this email. Please register for a pass.' };
    }
    if (user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    if (!user.password && password) {
      user.password = password;
      this.updateUser(user.id, { password });
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  public addUser(user: UserProfile) {
    const list = this.getUsers();
    const index = list.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...user };
    } else {
      list.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    this.notify();

    // Async direct write / upsert to Supabase
    this.fireSupabase(() => supabase.from('profiles').upsert(userToDbProfile(user)));
  }

  public updateUser(id: string, updates: Partial<UserProfile>) {
    const list = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    
    // Sync current user if affected
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...current, ...updates }));
    }
    this.notify();

    // Async write to Supabase
    const targetUser = list.find(u => u.id === id);
    if (targetUser) {
      this.fireSupabase(() => supabase.from('profiles').upsert(userToDbProfile(targetUser)));
    }
  }

  public deleteUser(id: string) {
    const list = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(null);
    }
    this.notify();

    // Async delete from Supabase
    this.fireSupabase(() => supabase.from('profiles').delete().eq('id', id));
  }

  // Blocked Users
  public getBlockedUserIds(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  public blockUser(targetId: string) {
    const list = this.getBlockedUserIds();
    if (!list.includes(targetId)) {
      list.push(targetId);
      localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(list));
      this.notify();

      const current = this.getCurrentUser();
      if (current) {
        this.fireSupabase(() => 
          supabase.from('blocked_users').insert({
            user_id: current.id,
            blocked_user_id: targetId,
          })
        );
      }
    }
  }

  public unblockUser(targetId: string) {
    const list = this.getBlockedUserIds().filter(id => id !== targetId);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(list));
    this.notify();

    const current = this.getCurrentUser();
    if (current) {
      this.fireSupabase(() => 
        supabase
          .from('blocked_users')
          .delete()
          .eq('user_id', current.id)
          .eq('blocked_user_id', targetId)
      );
    }
  }

  // Events
  public getEvents(): PartyEvent[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return val ? JSON.parse(val) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  }

  public addEvent(event: PartyEvent) {
    const list = this.getEvents();
    list.unshift(event);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();

    // Async direct write to Supabase events table
    this.fireSupabase(() => supabase.from('events').insert(partyToDbEvent(event)));
  }

  public updateEvent(id: string, updates: Partial<PartyEvent>) {
    const list = this.getEvents().map(e => e.id === id ? { ...e, ...updates } : e);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();

    const target = list.find(e => e.id === id);
    if (target) {
      this.fireSupabase(() => supabase.from('events').update(partyToDbEvent(target)).eq('id', id));
    }
  }

  public deleteEvent(id: string) {
    const list = this.getEvents().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();

    // Async delete from Supabase
    this.fireSupabase(() => supabase.from('events').delete().eq('id', id));
  }

  public toggleRsvp(eventId: string, userId: string) {
    let updatedEvent: PartyEvent | undefined;
    const list = this.getEvents().map(e => {
      if (e.id === eventId) {
        const hasJoined = e.attendeeIds.includes(userId);
        const attendeeIds = hasJoined 
          ? e.attendeeIds.filter(id => id !== userId)
          : [...e.attendeeIds, userId];
        updatedEvent = { ...e, attendeeIds };
        return updatedEvent;
      }
      return e;
    });
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();

    if (updatedEvent) {
      const atts = updatedEvent.attendeeIds;
      this.fireSupabase(() => supabase.from('events').update({ attendee_ids: atts }).eq('id', eventId));
    }
  }

  // Saved Bookmarks
  public getSavedEventIds(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SAVED_EVENTS);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  public toggleSaveEvent(eventId: string) {
    const list = this.getSavedEventIds();
    const next = list.includes(eventId) ? list.filter(id => id !== eventId) : [...list, eventId];
    localStorage.setItem(STORAGE_KEYS.SAVED_EVENTS, JSON.stringify(next));
    this.notify();

    const current = this.getCurrentUser();
    if (current) {
      if (list.includes(eventId)) {
        this.fireSupabase(() => 
          supabase
            .from('saved_events')
            .delete()
            .eq('user_id', current.id)
            .eq('event_id', eventId)
        );
      } else {
        this.fireSupabase(() => 
          supabase
            .from('saved_events')
            .insert({
              user_id: current.id,
              event_id: eventId,
            })
        );
      }
    }
  }

  // Cocktails
  public getCocktails(): CocktailItem[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.COCKTAILS);
      return val ? JSON.parse(val) : INITIAL_COCKTAILS;
    } catch {
      return INITIAL_COCKTAILS;
    }
  }

  public addCocktail(item: CocktailItem) {
    const list = this.getCocktails();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(list));
    this.notify();

    // Async direct write to Supabase
    this.fireSupabase(() => supabase.from('cocktails').insert(cocktailToDbItem(item)));
  }

  public updateCocktail(id: string, updates: Partial<CocktailItem>) {
    const list = this.getCocktails().map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(list));
    this.notify();

    const target = list.find(c => c.id === id);
    if (target) {
      this.fireSupabase(() => supabase.from('cocktails').update(cocktailToDbItem(target)).eq('id', id));
    }
  }

  public deleteCocktail(id: string) {
    const list = this.getCocktails().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(list));
    this.notify();

    // Async delete from Supabase
    this.fireSupabase(() => supabase.from('cocktails').delete().eq('id', id));
  }

  // Matches & Swipes
  public getMatches(): LoveMatch[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return val ? JSON.parse(val) : [
        {
          id: '12121212-3434-5656-7878-909090909090',
          user1Id: 'a1111111-1111-1111-1111-111111111111',
          user2Id: 'b2222222-2222-2222-2222-222222222222',
          createdAt: new Date().toISOString(),
        }
      ];
    } catch {
      return [];
    }
  }

  public addMatch(match: LoveMatch) {
    const list = this.getMatches();
    if (!list.some(m => (m.user1Id === match.user1Id && m.user2Id === match.user2Id) || (m.user1Id === match.user2Id && m.user2Id === match.user1Id))) {
      list.unshift(match);
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(list));
      this.notify();

      this.fireSupabase(() => 
        supabase
          .from('matches')
          .insert({
            id: match.id,
            user1_id: match.user1Id,
            user2_id: match.user2Id,
            is_super_like: Boolean(match.isSuperLike),
            created_at: match.createdAt || new Date().toISOString(),
          })
      );
    }
  }

  public getPassedUserIds(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.PASSES);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  public addPassUser(userId: string) {
    const list = this.getPassedUserIds();
    if (!list.includes(userId)) {
      list.push(userId);
      localStorage.setItem(STORAGE_KEYS.PASSES, JSON.stringify(list));
      this.notify();
    }
  }

  public resetSwipes() {
    localStorage.removeItem(STORAGE_KEYS.PASSES);
    this.notify();
  }

  // Friend Requests (Add Love 💕)
  public getFriendRequests(): FriendRequest[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  public sendFriendRequest(fromId: string, toId: string) {
    const list = this.getFriendRequests();
    if (!list.some(r => r.fromUserId === fromId && r.toUserId === toId)) {
      const newReq: FriendRequest = {
        id: generateUUID(),
        fromUserId: fromId,
        toUserId: toId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      list.unshift(newReq);
      localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(list));
      this.notify();

      this.fireSupabase(() => 
        supabase
          .from('friend_requests')
          .insert({
            id: newReq.id,
            from_user_id: fromId,
            to_user_id: toId,
            status: 'pending',
          })
      );
    }
  }

  public respondFriendRequest(requestId: string, status: 'accepted' | 'declined') {
    const list = this.getFriendRequests().map(r => r.id === requestId ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(list));
    
    // If accepted, add to matches
    const target = list.find(r => r.id === requestId);
    if (target && status === 'accepted') {
      this.addMatch({
        id: generateUUID(),
        user1Id: target.fromUserId,
        user2Id: target.toUserId,
        createdAt: new Date().toISOString()
      });
    }
    this.notify();

    this.fireSupabase(() => 
      supabase
        .from('friend_requests')
        .update({ status })
        .eq('id', requestId)
    );
  }

  // Chat Messages (Real-time direct messaging)
  public getMessages(): ChatMessage[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  public sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) {
    const list = this.getMessages();
    const newMsg: ChatMessage = {
      ...msg,
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    list.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    this.notify();

    // Async direct write to Supabase messages table
    this.fireSupabase(() => supabase.from('messages').insert(chatToDbMessage(newMsg)));

    return newMsg;
  }

  public markMessagesRead(recipientId: string, senderId: string) {
    const list = this.getMessages().map(m => {
      if (m.recipientId === recipientId && m.senderId === senderId && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    this.notify();

    this.fireSupabase(() => 
      supabase
        .from('messages')
        .update({ is_read: true })
        .eq('recipient_id', recipientId)
        .eq('sender_id', senderId)
    );
  }

  // Reports
  public getReports(): ContentReport[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return val ? JSON.parse(val) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  }

  public submitReport(rep: Omit<ContentReport, 'id' | 'createdAt' | 'status'>) {
    const list = this.getReports();
    const newRep: ContentReport = {
      ...rep,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    list.unshift(newRep);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    this.notify();

    this.fireSupabase(() => 
      supabase
        .from('reports')
        .insert({
          id: newRep.id,
          reporter_id: newRep.reporterId,
          target_type: newRep.targetType,
          target_id: newRep.targetId,
          target_title: newRep.targetTitle,
          reason: newRep.reason,
          details: newRep.details || '',
          status: newRep.status,
        })
    );
  }

  public updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    const list = this.getReports().map(r => r.id === reportId ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    this.notify();

    this.fireSupabase(() => 
      supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)
    );
  }

  // Payments
  public getPayments(): VendorPayment[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return val ? JSON.parse(val) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  }

  public recordVendorPayment(
    vendorId: string, 
    gatewayOrderId: string, 
    paymentGateway: 'PAYHERE' | 'PAYPAL' = 'PAYHERE'
  ) {
    const list = this.getPayments();
    const validUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const payment: VendorPayment = {
      id: generateUUID(),
      vendorId,
      amountLKR: 5000,
      plan: 'Monthly Vendor Pass',
      paymentGateway,
      gatewayOrderId,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      validUntil,
    };
    list.unshift(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(list));

    // Update vendor trial / valid pass
    this.updateUser(vendorId, { trialEndsAt: validUntil });
    this.notify();

    // Async direct write to Supabase
    this.fireSupabase(() => 
      supabase
        .from('payments')
        .insert({
          id: payment.id,
          vendor_id: vendorId,
          amount_lkr: payment.amountLKR,
          plan: payment.plan,
          payment_gateway: payment.paymentGateway,
          gateway_order_id: payment.gatewayOrderId,
          status: payment.status,
          valid_until: payment.validUntil,
          created_at: payment.createdAt,
        })
    );
  }

  // Supabase SQL Schema Export
  public getSupabaseSQLSchema(): string {
    return FULL_SUPABASE_SQL;
  }
}

export const storage = new StorageService();
