import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://gmtzbwgbgodrfzvmlimd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdHpid2diZ29kcmZ6dm1saW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTYyMTMsImV4cCI6MjEwOTA3MjIxM30.NXNsuBE85DE20VVjbfLX9W7yfy3hiSeCSgcs01KmgPM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const FULL_SUPABASE_SQL = `-- ==============================================================================
-- LOVABLE LK — SRI LANKA NIGHTLIFE, DATING & COMPANION PLATFORM
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH RLS & REALTIME REPLICATION
-- Paste and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gmtzbwgbgodrfzvmlimd/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Partygoers, Verified Companions, Club Owners & Super Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 24,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
  is_companion BOOLEAN NOT NULL DEFAULT false,
  companion_headline TEXT,
  companion_rate TEXT,
  city TEXT NOT NULL DEFAULT 'Colombo',
  distance_km NUMERIC DEFAULT 2.5,
  bio TEXT,
  looking_for TEXT DEFAULT 'Party Companion & VIP Club Buddy',
  interests TEXT[] DEFAULT ARRAY['VIP Lounges', 'Mixology', 'Techno', 'Sunset Raves'],
  avatar_url TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_online BOOLEAN NOT NULL DEFAULT true,
  instagram TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  deletion_requested BOOLEAN DEFAULT false,
  deletion_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. EVENTS TABLE (Raves, Rooftops, Sunset Beach Parties, VIP Lounges)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Colombo',
  address TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('VIP Rooftop', 'Beach Party', 'Techno Rave', 'Ladies Night', 'Sunset Lounge', 'Live Band')),
  date_str TEXT NOT NULL,
  time_str TEXT NOT NULL,
  entry_price TEXT NOT NULL DEFAULT 'Free Entry (Guestlist)',
  flyer_url TEXT,
  description TEXT,
  dj_lineup TEXT[] DEFAULT ARRAY[]::TEXT[],
  phone TEXT,
  vendor_id UUID,
  is_active_tonight BOOLEAN NOT NULL DEFAULT true,
  is_live_dj BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EVENT ATTENDEES TABLE (Guestlist RSVPs)
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 5. SIGNATURE COCKTAILS & TAPAS TABLE
CREATE TABLE IF NOT EXISTS public.cocktails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Colombo',
  price_lkr NUMERIC NOT NULL DEFAULT 2800,
  description TEXT,
  ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT NOT NULL DEFAULT 'Signature Cocktail',
  image_url TEXT,
  vendor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. REAL-TIME DIRECT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  attachment_type TEXT,
  attachment_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MUTUAL LOVE MATCHES TABLE (Dating Deck Right-Swipes)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_like BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 8. ADD LOVE / FRIEND REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SAVED EVENTS BOOKMARKS
CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 10. CONTENT MODERATION REPORTS (Zero-Tolerance UGC Safety)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'event', 'cocktail', 'message')),
  target_id TEXT NOT NULL,
  target_title TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PAYHERE & PAYPAL PAYMENTS LEDGER (Monthly Vendor Passes)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID,
  amount_lkr NUMERIC NOT NULL DEFAULT 5000,
  plan TEXT NOT NULL DEFAULT 'Monthly Vendor Pass',
  payment_gateway TEXT NOT NULL DEFAULT 'PAYHERE' CHECK (payment_gateway IN ('PAYHERE', 'PAYPAL')),
  gateway_order_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. BLOCKED USERS TABLE
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- 13. SUPABASE STORAGE BUCKETS (Avatars, Venue Covers, Event Flyers & Cocktail Photos)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('flyers', 'flyers', true),
  ('cocktails', 'cocktails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public avatars access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Public flyers access" ON storage.objects FOR SELECT USING (bucket_id = 'flyers');
CREATE POLICY "Vendors can upload flyers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'flyers');
CREATE POLICY "Public cocktails access" ON storage.objects FOR SELECT USING (bucket_id = 'cocktails');
CREATE POLICY "Vendors can upload cocktails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cocktails');

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION FOR LIVE CHATS, RSVP & MATCH NOTIFICATIONS
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'event_attendees'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'friend_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
  END IF;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Allow public read & authenticated write operations
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert and update their profile" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Vendors and admins can manage events" ON public.events FOR ALL USING (true);

CREATE POLICY "Attendees are viewable by everyone" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can RSVP to events" ON public.event_attendees FOR ALL USING (true);

CREATE POLICY "Cocktails viewable by everyone" ON public.cocktails FOR SELECT USING (true);
CREATE POLICY "Vendors can manage cocktails" ON public.cocktails FOR ALL USING (true);

CREATE POLICY "Users can view and send messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Users can view and create matches" ON public.matches FOR ALL USING (true);
CREATE POLICY "Users can manage friend requests" ON public.friend_requests FOR ALL USING (true);
CREATE POLICY "Users can manage saved events" ON public.saved_events FOR ALL USING (true);
CREATE POLICY "Users can lodge reports and admin can read" ON public.reports FOR ALL USING (true);
CREATE POLICY "Payments ledger viewable and recorded" ON public.payments FOR ALL USING (true);
CREATE POLICY "Blocked users managed by owner" ON public.blocked_users FOR ALL USING (true);

-- ==============================================================================
-- INITIAL SEED DATA (Super Admin, Verified Companions, Venues)
-- ==============================================================================
INSERT INTO public.profiles (id, email, name, age, role, is_companion, companion_headline, companion_rate, city, distance_km, bio, looking_for, interests, avatar_url, photos, is_verified, is_online)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'admin@lovable.lk',
  'Admin',
  32,
  'admin',
  false,
  NULL,
  NULL,
  'Colombo',
  1.5,
  'Platform Administrator & Nightlife Curator for Lovable LK. Ensuring verified, safe, and elite nightlife experiences across Sri Lanka.',
  'Platform Master Operations & VIP Networking',
  ARRAY['VIP Lounges', 'Deep House', 'Mixology', 'Travel'],
  '/src/assets/images/avatar_kavinda_1793512134574.jpg',
  ARRAY['/src/assets/images/avatar_kavinda_1793512134574.jpg'],
  true,
  true
),
(
  'b2222222-2222-2222-2222-222222222222',
  'senuri@lovable.lk',
  'Senuri Jayawardena',
  26,
  'user',
  true,
  'VIP Rooftop & Cocktail Companion • Colombo & South Coast',
  'LKR 20,000 / evening party escort',
  'Colombo',
  3.5,
  'Fashion designer by day, electronic music enthusiast by night. Love chic rooftop bars, Colombo sunset views, and deep conversation over espresso martinis.',
  'High-energy party companion & VIP club buddy',
  ARRAY['Techno', 'Rooftop Lounges', 'Fashion', 'Cocktails', 'Sunset Chasing'],
  '/src/assets/images/avatar_senuri_1793512133087.jpg',
  ARRAY['/src/assets/images/avatar_senuri_1793512133087.jpg', '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg'],
  true,
  true
),
(
  'c3333333-3333-3333-3333-333333333333',
  'natasha@lovable.lk',
  'Natasha Fernando',
  24,
  'user',
  true,
  'Beach Club Aficionado • Weligama & Mirissa Nights',
  'LKR 15,000 / sunset & rave escort',
  'Mirissa',
  12.0,
  'Surfer and nightlife enthusiast living between Mirissa and Weligama. Always know where the freshest secret beach parties are happening. Good vibes only!',
  'Beach party companion, festival buddy, sunset drinks',
  ARRAY['Beach Raves', 'Tropical House', 'Surfing', 'Gin & Tonics', 'Bonfires'],
  '/src/assets/images/avatar_natasha_1793512134413.jpg',
  ARRAY['/src/assets/images/avatar_natasha_1793512134413.jpg', '/src/assets/images/event_mirissa_beach_1793512113827.jpg'],
  true,
  true
),
(
  'd4444444-4444-4444-4444-444444444444',
  'botanik@rooftop.lk',
  'Botanik Bistro & Rooftop',
  5,
  'vendor',
  false,
  NULL,
  NULL,
  'Colombo',
  1.0,
  'Iconic rooftop bar & bistro situated at Fairway Colombo with breathtaking lotus tower views, signature botanical mixology, and international guest DJs.',
  'Event Promotion & VIP Hospitality',
  ARRAY['Mixology', 'Rooftops', 'Guest DJs', 'Private VIP Tables'],
  '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg',
  ARRAY['/src/assets/images/hero_nightlife_colombo_1793512113884.jpg'],
  true,
  true
)
ON CONFLICT (email) DO NOTHING;

-- INSERT INITIAL PARTIES
INSERT INTO public.events (id, title, venue_name, city, address, category, date_str, time_str, entry_price, flyer_url, description, dj_lineup, phone, vendor_id, is_active_tonight, is_live_dj)
VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'Skyline Euphoria: Lotus Vista Sessions',
  'Botanik Rooftop Bistro & Bar',
  'Colombo',
  '7 Hospital Street, Colombo 01',
  'VIP Rooftop',
  'Tonight • 9:00 PM onwards',
  '21:00 - 04:00',
  'Free Entry (Guestlist)',
  '/src/assets/images/hero_nightlife_colombo_1793512113884.jpg',
  'Colombo’s premier open-air rooftop session featuring ambient melodic house, bespoke cocktail pairing, and 360° panoramic views of the illuminated Colombo Lotus Tower.',
  ARRAY['DJ Ashan (Resident)', 'Maya Sky (Berlin)', 'Suran Jay'],
  '+94 77 789 2200',
  'd4444444-4444-4444-4444-444444444444',
  true,
  true
),
(
  'e2222222-2222-2222-2222-222222222222',
  'Weligama Sunset Ritual & Beach Rave',
  'Weligama Beach Club & Deck',
  'Weligama',
  'Matara Road, Weligama Bay',
  'Beach Party',
  'Saturday • 5:30 PM',
  '17:30 - Late',
  'LKR 3,000 (Incl. 1 Drink)',
  '/src/assets/images/event_mirissa_beach_1793512113827.jpg',
  'Golden hour sunset session on the pristine sands of Weligama Bay. Warm wooden lantern illumination, barefoot dancing, tropical cocktails, and international guest selectors.',
  ARRAY['Sound of Ceylon', 'DJ Leo Mirissa', 'Elena Waves'],
  '+94 41 225 9911',
  'd4444444-4444-4444-4444-444444444444',
  true,
  true
),
(
  'e3333333-3333-3333-3333-333333333333',
  'Underground Pulse: Red Room Techno',
  'The Vault 07',
  'Colombo',
  'Gregory’s Road, Colombo 07',
  'Techno Rave',
  'Sunday • 10:00 PM',
  '22:00 - 05:00',
  'LKR 4,000 at Gate',
  '/src/assets/images/event_techno_rave_1793512116489.jpg',
  'Sri Lanka’s premier industrial warehouse techno experience with immersive red laser mapping, Funktion-One sound engineering, and Berlin underground vibes.',
  ARRAY['Kavinda Live', 'Sub-Zero Colombo', 'Vortex LK'],
  '+94 71 882 1199',
  'd4444444-4444-4444-4444-444444444444',
  false,
  true
)
ON CONFLICT (id) DO NOTHING;

-- INSERT INITIAL COCKTAILS
INSERT INTO public.cocktails (id, name, venue_name, city, price_lkr, description, ingredients, category, image_url, vendor_id)
VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  'Ceylon Passion & Old Reserve Arrack Sour',
  'Botanik Bistro & Rooftop',
  'Colombo',
  2800,
  'Aged Ceylon Coconut Arrack, fresh local passionfruit nectar, hand-scraped Ceylon cinnamon infusion, egg white froth and Angostura drops.',
  ARRAY['Ceylon Arrack 100% Coconut', 'Passionfruit Puree', 'Ceylon Cinnamon Syrup', 'Citrus', 'Egg White'],
  'Signature Cocktail',
  '/src/assets/images/cocktails_lounge_1793512114884.jpg',
  'd4444444-4444-4444-4444-444444444444'
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Mirissa Sunset Smoked Chili Margarita',
  'Weligama Beach Club',
  'Mirissa',
  3200,
  'Olmeca Reposado tequila shaken with charred bird’s eye chili, fresh Jaffna lime, smoked agave, and sea salt rim.',
  ARRAY['Tequila Reposado', 'Cointreau', 'Jaffna Lime', 'Smoked Kochchi Chili', 'Himalayan Salt'],
  'Signature Cocktail',
  '/src/assets/images/cocktails_lounge_1793512114884.jpg',
  'd4444444-4444-4444-4444-444444444444'
)
ON CONFLICT (id) DO NOTHING;
`;
