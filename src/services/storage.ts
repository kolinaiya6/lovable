import { 
  UserProfile, 
  PartyEvent, 
  CocktailItem, 
  ChatMessage, 
  LoveMatch, 
  FriendRequest, 
  ContentReport, 
  VendorPayment 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_EVENTS, 
  INITIAL_COCKTAILS, 
  INITIAL_REPORTS, 
  INITIAL_PAYMENTS 
} from '../data/mockData';
import { FULL_SUPABASE_SQL } from './supabase';

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

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDefaults();
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
    // Clean visitor state: Clear any auto-assigned admin session from previous runs so visitors start unauthenticated as guests
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
          id: 'msg_1',
          senderId: 'user_senuri',
          recipientId: 'user_admin',
          text: 'Ayubowan! Are you attending the Lotus Vista session at Botanik tonight? 🥂',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
        },
        {
          id: 'msg_2',
          senderId: 'user_admin',
          recipientId: 'user_senuri',
          text: 'Hey Senuri! Yes, reserved a VIP table on the terrace. Let’s connect over cocktails! ✨',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: true,
        }
      ];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(sampleMessages));
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
      // Also update in users list if present
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
    const index = list.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      list[index] = { ...list[index], ...user };
    } else {
      list.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    this.notify();
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
  }

  public deleteUser(id: string) {
    const list = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(null);
    }
    this.notify();
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
    }
  }

  public unblockUser(targetId: string) {
    const list = this.getBlockedUserIds().filter(id => id !== targetId);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(list));
    this.notify();
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
  }

  public updateEvent(id: string, updates: Partial<PartyEvent>) {
    const list = this.getEvents().map(e => e.id === id ? { ...e, ...updates } : e);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();
  }

  public deleteEvent(id: string) {
    const list = this.getEvents().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();
  }

  public toggleRsvp(eventId: string, userId: string) {
    const list = this.getEvents().map(e => {
      if (e.id === eventId) {
        const hasJoined = e.attendeeIds.includes(userId);
        const attendeeIds = hasJoined 
          ? e.attendeeIds.filter(id => id !== userId)
          : [...e.attendeeIds, userId];
        return { ...e, attendeeIds };
      }
      return e;
    });
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
    this.notify();
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
  }

  public deleteCocktail(id: string) {
    const list = this.getCocktails().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COCKTAILS, JSON.stringify(list));
    this.notify();
  }

  // Matches & Swipes
  public getMatches(): LoveMatch[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return val ? JSON.parse(val) : [
        {
          id: 'match_1',
          user1Id: 'user_admin',
          user2Id: 'user_senuri',
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
      list.unshift({
        id: `fr_${Date.now()}`,
        fromUserId: fromId,
        toUserId: toId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(list));
      this.notify();
    }
  }

  public respondFriendRequest(requestId: string, status: 'accepted' | 'declined') {
    const list = this.getFriendRequests().map(r => r.id === requestId ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(list));
    
    // If accepted, add to matches
    const target = list.find(r => r.id === requestId);
    if (target && status === 'accepted') {
      this.addMatch({
        id: `match_${Date.now()}`,
        user1Id: target.fromUserId,
        user2Id: target.toUserId,
        createdAt: new Date().toISOString()
      });
    }
    this.notify();
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
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    list.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    this.notify();
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
    list.unshift({
      ...rep,
      id: `rep_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    this.notify();
  }

  public updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    const list = this.getReports().map(r => r.id === reportId ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(list));
    this.notify();
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
      id: `pay_${Date.now()}`,
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
  }

  // Supabase SQL Schema Export
  public getSupabaseSQLSchema(): string {
    return FULL_SUPABASE_SQL;
  }
}

export const storage = new StorageService();

