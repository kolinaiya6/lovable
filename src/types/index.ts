export type UserRole = 'user' | 'vendor' | 'admin';

export type SriLankanCity = 
  | 'Colombo'
  | 'Mount Lavinia'
  | 'Negombo'
  | 'Bentota'
  | 'Hikkaduwa'
  | 'Galle'
  | 'Unawatuna'
  | 'Ahangama'
  | 'Weligama'
  | 'Mirissa'
  | 'Matara'
  | 'Hiriketiya'
  | 'Tangalle'
  | 'Ella'
  | 'Kandy'
  | 'Nuwara Eliya'
  | 'Sigiriya'
  | 'Dambulla'
  | 'Anuradhapura'
  | 'Trincomalee'
  | 'Arugam Bay'
  | 'Batticaloa'
  | 'Jaffna';

export const ALL_SRI_LANKAN_CITIES: SriLankanCity[] = [
  'Colombo',
  'Mount Lavinia',
  'Negombo',
  'Bentota',
  'Hikkaduwa',
  'Galle',
  'Unawatuna',
  'Ahangama',
  'Weligama',
  'Mirissa',
  'Matara',
  'Hiriketiya',
  'Tangalle',
  'Ella',
  'Kandy',
  'Nuwara Eliya',
  'Sigiriya',
  'Dambulla',
  'Anuradhapura',
  'Trincomalee',
  'Arugam Bay',
  'Batticaloa',
  'Jaffna',
];

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  age: number;
  role: UserRole;
  isCompanion: boolean;
  companionHeadline?: string;
  companionRate?: string; // e.g. "LKR 15,000 / event" or "Complimentary company"
  city: SriLankanCity;
  distanceKm: number;
  bio: string;
  lookingFor: string; // e.g. "Party Companion", "Casual Dating", "VIP Club Buddy", "Festival Partner"
  interests: string[];
  avatarUrl: string;
  photos: string[];
  isVerified: boolean;
  isOnline: boolean;
  instagram?: string;
  createdAt: string;
  trialEndsAt?: string; // for vendors (30-day free trial)
  subscriptionStatus?: 'active' | 'expired' | 'trial';
  subscriptionExpiresAt?: string; // ISO timestamp
  subscriptionTier?: string; // e.g. "Monthly Vendor Pass"
  deletionRequested?: boolean;
  deletionReason?: string;
}

export interface PartyEvent {
  id: string;
  title: string;
  venueName: string;
  city: SriLankanCity;
  address: string;
  category: 'Beach Party' | 'Techno Rave' | 'Ladies Night' | 'Sunset Lounge' | 'VIP Rooftop' | 'Live Band';
  dateStr: string;
  timeStr: string;
  entryPrice: string; // e.g. "Free Entry", "LKR 3,500"
  flyerUrl: string;
  description: string;
  djLineup?: string[];
  attendeeIds: string[];
  vendorId: string;
  phone: string;
  isActiveTonight: boolean;
  isLiveDJ: boolean;
  startsAt?: string; // ISO string for automated 2-hour pre-event alerts
}

export interface AppNotification {
  id: string;
  userId: string;
  eventId?: string;
  type: 'event_reminder_2h' | 'friend_request' | 'match' | 'vip_announcement';
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor?: string;
  createdAt: string;
}

export interface CocktailItem {
  id: string;
  name: string;
  venueName: string;
  city: SriLankanCity;
  priceLKR: number;
  description: string;
  ingredients: string[];
  category: 'Signature Cocktail' | 'Tapas & Bites' | 'Shooter' | 'Mocktail';
  imageUrl: string;
  vendorId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentType?: 'party_invite' | 'cocktail_cheers' | 'location';
  attachmentData?: string;
}

export interface LoveMatch {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  isSuperLike?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: 'profile' | 'event' | 'cocktail' | 'message';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'pending' | 'dismissed' | 'resolved';
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amountLKR: number;
  amountUSD?: number;
  plan: string;
  paymentGateway: 'PAYPAL' | 'PAYHERE';
  gatewayOrderId: string;
  paypalOrderId?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  validUntil: string;
  monthsAdded?: number;
}

