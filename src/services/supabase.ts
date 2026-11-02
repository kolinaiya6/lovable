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
-- COMPLETE PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH AUTH, RLS, STORAGE & REALTIME
-- Target Project URL: https://gmtzbwgbgodrfzvmlimd.supabase.co
-- Paste and run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gmtzbwgbgodrfzvmlimd/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (Partygoers, Verified Companions, Club Owners & Super Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
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

-- Connect profiles.id to auth.users(id) safely if auth schema is present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 3. EVENTS TABLE (Raves, Rooftops, Sunset Beach Parties, VIP Lounges)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Colombo',
  address TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Beach Party',
  date_str TEXT NOT NULL,
  time_str TEXT NOT NULL,
  entry_price TEXT NOT NULL DEFAULT 'Free Entry',
  flyer_url TEXT NOT NULL,
  description TEXT NOT NULL,
  dj_lineup TEXT[] DEFAULT ARRAY[]::TEXT[],
  attendee_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  vendor_id TEXT,
  phone TEXT,
  is_active_tonight BOOLEAN NOT NULL DEFAULT false,
  is_live_dj BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours 15 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely ensure starts_at column exists on events if table already created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'starts_at'
  ) THEN
    ALTER TABLE public.events ADD COLUMN starts_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours 15 minutes');
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. SIGNATURE COCKTAILS & TAPAS (Nightclub / Bar Mixology Menus)
CREATE TABLE IF NOT EXISTS public.cocktails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Colombo',
  price_lkr NUMERIC NOT NULL DEFAULT 2500,
  description TEXT NOT NULL,
  ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT NOT NULL DEFAULT 'Signature Cocktail',
  image_url TEXT NOT NULL,
  vendor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. REALTIME CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  attachment_type TEXT,
  attachment_data TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AUTOMATED NOTIFICATIONS & 2-HOUR EVENT RADAR ALERTS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'event_reminder_2h' CHECK (type IN ('event_reminder_2h', 'friend_request', 'match', 'vip_announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MUTUAL DATING MATCHES
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_like BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 8. LOVE & FRIEND REQUESTS
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- 9. SAVED / BOOKMARKED EVENTS
CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 10. CONTENT MODERATION REPORTS (Zero-Tolerance Safety)
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

-- ==============================================================================
-- AUTOMATED 2-HOUR PRE-EVENT REMINDER FUNCTION
-- Checks RSVP'd events starting between NOW and NOW + 2 HOURS, generating alerts for attendees
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.generate_event_reminders()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  v_count INTEGER := 0;
  v_attendee_id TEXT;
BEGIN
  FOR r IN 
    SELECT e.id AS event_id, e.title, e.venue_name, e.time_str, e.attendee_ids, e.starts_at
    FROM public.events e
    WHERE e.starts_at IS NOT NULL
      AND e.starts_at > NOW()
      AND e.starts_at <= (NOW() + INTERVAL '2 hours')
  LOOP
    IF r.attendee_ids IS NOT NULL THEN
      FOREACH v_attendee_id IN ARRAY r.attendee_ids LOOP
        -- Only insert if notification has not been created yet for this event and attendee
        IF NOT EXISTS (
          SELECT 1 FROM public.notifications 
          WHERE user_id = v_attendee_id::uuid 
            AND event_id = r.event_id 
            AND type = 'event_reminder_2h'
        ) THEN
          INSERT INTO public.notifications (
            id, user_id, event_id, type, title, message, is_read, scheduled_for, created_at
          )
          VALUES (
            uuid_generate_v4(),
            v_attendee_id::uuid,
            r.event_id,
            'event_reminder_2h',
            '⏰ Event Starts in Under 2 Hours!',
            'Your RSVP for "' || r.title || '" at ' || r.venue_name || ' starts soon (' || r.time_str || '). Present your VIP Pass at the door!',
            false,
            r.starts_at,
            NOW()
          );
          v_count := v_count + 1;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;

-- ==============================================================================
-- PERMISSIONS & ROLES (Ensures anon and authenticated users can read/write)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access on profiles" ON public.profiles;
CREATE POLICY "Public access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on events" ON public.events;
CREATE POLICY "Public access on events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on cocktails" ON public.cocktails;
CREATE POLICY "Public access on cocktails" ON public.cocktails FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on messages" ON public.messages;
CREATE POLICY "Public access on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on notifications" ON public.notifications;
CREATE POLICY "Public access on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on matches" ON public.matches;
CREATE POLICY "Public access on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on friend_requests" ON public.friend_requests;
CREATE POLICY "Public access on friend_requests" ON public.friend_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on saved_events" ON public.saved_events;
CREATE POLICY "Public access on saved_events" ON public.saved_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on reports" ON public.reports;
CREATE POLICY "Public access on reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on payments" ON public.payments;
CREATE POLICY "Public access on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on blocked_users" ON public.blocked_users;
CREATE POLICY "Public access on blocked_users" ON public.blocked_users FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC REGISTRATION TRIGGER (auth.users -> public.profiles synchronization)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    password_hash,
    name,
    role,
    city,
    avatar_url,
    photos,
    is_companion,
    companion_headline,
    companion_rate,
    bio,
    looking_for,
    interests,
    is_verified,
    is_online,
    trial_ends_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.encrypted_password,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN LOWER(NEW.email) = 'kolinaiya6@gmail.com' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    END,
    COALESCE(NEW.raw_user_meta_data->>'city', 'Colombo'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'),
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')],
    COALESCE((NEW.raw_user_meta_data->>'is_companion')::boolean, false),
    NEW.raw_user_meta_data->>'companion_headline',
    NEW.raw_user_meta_data->>'companion_rate',
    COALESCE(
      NEW.raw_user_meta_data->>'bio',
      CASE 
        WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'vendor' 
          THEN 'Official nightlife venue & event curator in ' || COALESCE(NEW.raw_user_meta_data->>'city', 'Colombo') || ', Sri Lanka.'
        WHEN COALESCE((NEW.raw_user_meta_data->>'is_companion')::boolean, false) = true
          THEN 'Verified nightlife & party companion for curated club experiences.'
        ELSE 'Nightlife enthusiast looking for vibrant dance parties, cocktails, and good vibes.'
      END
    ),
    COALESCE(NEW.raw_user_meta_data->>'looking_for', 'Casual Dating & Dance Partner'),
    ARRAY['VIP Lounges', 'Mixology', 'Techno', 'Sunset Raves'],
    true,
    true,
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'vendor' THEN NOW() + INTERVAL '30 days'
      ELSE NULL
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'kolinaiya6@gmail.com' THEN 'admin'
      ELSE EXCLUDED.role 
    END,
    city = EXCLUDED.city,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKETS (Avatars, Venue Covers, Event Flyers & Cocktails)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('venue-covers', 'venue-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('flyers', 'flyers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('cocktails', 'cocktails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760;

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view venue-covers" ON storage.objects;
DROP POLICY IF EXISTS "Public can view flyers" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cocktails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload venue-covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload flyers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload cocktails" ON storage.objects;

CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public can view venue-covers" ON storage.objects FOR SELECT USING (bucket_id = 'venue-covers');
CREATE POLICY "Public can view flyers" ON storage.objects FOR SELECT USING (bucket_id = 'flyers');
CREATE POLICY "Public can view cocktails" ON storage.objects FOR SELECT USING (bucket_id = 'cocktails');

CREATE POLICY "Anyone can upload avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload venue-covers" ON storage.objects FOR ALL USING (bucket_id = 'venue-covers') WITH CHECK (bucket_id = 'venue-covers');
CREATE POLICY "Anyone can upload flyers" ON storage.objects FOR ALL USING (bucket_id = 'flyers') WITH CHECK (bucket_id = 'flyers');
CREATE POLICY "Anyone can upload cocktails" ON storage.objects FOR ALL USING (bucket_id = 'cocktails') WITH CHECK (bucket_id = 'cocktails');

-- ==============================================================================
-- REALTIME REPLICATION (Instant Chat, Events, Cocktails, Notifications & Live Attendance)
-- ==============================================================================
DO $$
DECLARE
  t text;
  tables_to_add text[] := ARRAY['profiles', 'events', 'cocktails', 'messages', 'notifications', 'matches', 'friend_requests', 'saved_events', 'reports', 'payments', 'blocked_users'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  FOREACH t IN ARRAY tables_to_add LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- ==============================================================================
-- PRODUCTION LOGINS & SEED ACCOUNTS (auth.users + public.profiles)
-- 1. Super Admin: kolinaiya6@gmail.com  | Password: Admin@123456
-- 2. Venue Owner: botanik@rooftop.lk   | Password: Venue@123456
-- 3. Companion:   senuri@lovable.lk    | Password: Lovable@123456
-- 4. Companion:   natasha@lovable.lk   | Password: Lovable@123456
-- 5. Partygoer:   arjun@party.lk       | Password: Party@123456
-- 6. Partygoer:   dinesh@party.lk      | Password: Party@123456
-- ==============================================================================
DO $$
DECLARE
  v_admin_id UUID := 'a1111111-1111-1111-1111-111111111111';
  v_venue_id UUID := 'd4444444-4444-4444-4444-444444444444';
  v_senuri_id UUID := 'b2222222-2222-2222-2222-222222222222';
  v_natasha_id UUID := 'c3333333-3333-3333-3333-333333333333';
  v_arjun_id UUID := 'e5555555-5555-5555-5555-555555555555';
  v_dinesh_id UUID := 'f6666666-6666-6666-6666-666666666666';
BEGIN
  -- 1. Super Admin
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'kolinaiya6@gmail.com', crypt('Admin@123456', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin Kolin","role":"admin","city":"Colombo"}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Admin@123456', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- 2. Venue Owner
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    v_venue_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'botanik@rooftop.lk', crypt('Venue@123456', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Botanik Bistro & Rooftop","role":"vendor","city":"Colombo"}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Venue@123456', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- 3. Senuri (Companion)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    v_senuri_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'senuri@lovable.lk', crypt('Lovable@123456', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Senuri Jayawardena","role":"user","city":"Colombo","is_companion":true}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Lovable@123456', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- 4. Natasha (Companion)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    v_natasha_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'natasha@lovable.lk', crypt('Lovable@123456', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Natasha Fernando","role":"user","city":"Mirissa","is_companion":true}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Lovable@123456', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- 5. Arjun (Partygoer)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    v_arjun_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'arjun@party.lk', crypt('Party@123456', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Arjun Perera","role":"user","city":"Colombo"}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Party@123456', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- 6. Dinesh (Partygoer)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    v_dinesh_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'dinesh@party.lk', crypt('Party@123456', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dinesh Wickramasinghe","role":"user","city":"Galle"}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Party@123456', gen_salt('bf')),
    email_confirmed_at = NOW();

EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Populate public.profiles
INSERT INTO public.profiles (id, email, password_hash, name, age, role, is_companion, companion_headline, companion_rate, city, distance_km, bio, looking_for, interests, avatar_url, photos, is_verified, is_online)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'kolinaiya6@gmail.com',
  'Admin@123456',
  'Admin Kolin',
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
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'],
  true,
  true
),
(
  'b2222222-2222-2222-2222-222222222222',
  'senuri@lovable.lk',
  'Lovable@123456',
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
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
  true,
  true
),
(
  'c3333333-3333-3333-3333-333333333333',
  'natasha@lovable.lk',
  'Lovable@123456',
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
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'],
  true,
  true
),
(
  'd4444444-4444-4444-4444-444444444444',
  'botanik@rooftop.lk',
  'Venue@123456',
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
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80'],
  true,
  true
),
(
  'e5555555-5555-5555-5555-555555555555',
  'arjun@party.lk',
  'Party@123456',
  'Arjun Perera',
  29,
  'user',
  false,
  NULL,
  NULL,
  'Colombo',
  5.2,
  'Music curator, resident DJ, and late-night culinary explorer. If you need a partner to explore underground techno spots in Colombo 07, hit me up.',
  'Dance partners and late night conversation',
  ARRAY['Deep House', 'Afrobeat', 'Vinyl Sessions', 'Tapas'],
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'],
  true,
  true
),
(
  'f6666666-6666-6666-6666-666666666666',
  'dinesh@party.lk',
  'Party@123456',
  'Dinesh Wickramasinghe',
  31,
  'user',
  false,
  NULL,
  NULL,
  'Galle',
  25.0,
  'Architect based in historic Galle Fort. Avid traveler, collector of Ceylon spirits, and jazz aficionado. Looking to connect for dinners and weekend escapes.',
  'Casual dating & cocktail explorer',
  ARRAY['Jazz & Soul', 'Fine Dining', 'Arrack Cocktails'],
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80'],
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- 13. INITIAL PARTIES & RAVES (With starts_at for automated 2-hour pre-event reminder tests)
INSERT INTO public.events (id, title, venue_name, city, address, category, date_str, time_str, entry_price, flyer_url, description, dj_lineup, attendee_ids, vendor_id, phone, is_active_tonight, is_live_dj, starts_at)
VALUES
(
  '11111111-aaaa-1111-1111-111111111111',
  'Skyline Euphoria: Lotus Vista Sessions',
  'Botanik Rooftop Bistro & Bar',
  'Colombo',
  '7 Hospital Street, Colombo 01',
  'VIP Rooftop',
  'Tonight • 9:00 PM onwards',
  '21:00 - 04:00',
  'Free Entry (Guestlist)',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  'Colombo’s premier open-air rooftop session featuring ambient melodic house, bespoke cocktail pairing, and 360° panoramic views of the illuminated Colombo Lotus Tower.',
  ARRAY['DJ Ashan (Resident)', 'Maya Sky (Berlin)', 'Suran Jay'],
  ARRAY['a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555'],
  'd4444444-4444-4444-4444-444444444444',
  '+94 77 789 2200',
  true,
  true,
  NOW() + INTERVAL '1 hour 45 minutes'
),
(
  '22222222-bbbb-2222-2222-222222222222',
  'Weligama Sunset Ritual & Beach Rave',
  'Weligama Beach Club & Deck',
  'Weligama',
  'Matara Road, Weligama Bay',
  'Beach Party',
  'Saturday • 5:30 PM',
  '17:30 - Late',
  'LKR 3,000 (Incl. 1 Drink)',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  'Golden hour sunset session on the pristine sands of Weligama Bay. Warm wooden lantern illumination, barefoot dancing, tropical cocktails, and international guest selectors.',
  ARRAY['Sound of Ceylon', 'DJ Leo Mirissa', 'Elena Waves'],
  ARRAY['c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111'],
  'd4444444-4444-4444-4444-444444444444',
  '+94 41 225 9911',
  true,
  true,
  NOW() + INTERVAL '26 hours'
),
(
  '33333333-cccc-3333-3333-333333333333',
  'Underground Pulse: Red Room Techno',
  'The Vault 07',
  'Colombo',
  'Gregory’s Road, Colombo 07',
  'Techno Rave',
  'Sunday • 10:00 PM',
  '22:00 - 05:00',
  'LKR 4,000 at Gate',
  'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=800&q=80',
  'Sri Lanka’s premier industrial warehouse techno experience with immersive red laser mapping, Funktion-One sound engineering, and Berlin underground vibes.',
  ARRAY['Kavinda Live', 'Sub-Zero Colombo', 'Vortex LK'],
  ARRAY['b2222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555'],
  'd4444444-4444-4444-4444-444444444444',
  '+94 71 882 1199',
  false,
  true,
  NOW() + INTERVAL '48 hours'
),
(
  '44444444-ffff-4444-4444-444444444444',
  'Champagne & Rose Ladies Night',
  'Cloud 9 Terrace Lounge',
  'Colombo',
  'Galle Face Green Promenade, Colombo',
  'Ladies Night',
  'Every Wednesday • 8:00 PM',
  '20:00 - 02:00',
  'Free Entry for Ladies + 2 Free Cocktails',
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  'The mid-week party haven for chic partygoers. Complimentary prosecco glasses on entry, live saxophonist performance, and premium tapas discounts.',
  ARRAY['DJ Dimuth K', 'Sax by Shanaka'],
  ARRAY['b2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333'],
  'd4444444-4444-4444-4444-444444444444',
  '+94 11 234 5678',
  false,
  false,
  NOW() + INTERVAL '72 hours'
)
ON CONFLICT (id) DO UPDATE SET
  flyer_url = EXCLUDED.flyer_url,
  starts_at = EXCLUDED.starts_at;

-- 14. INITIAL SIGNATURE COCKTAILS & TAPAS (High-res, guaranteed working CDN images)
INSERT INTO public.cocktails (id, name, venue_name, city, price_lkr, description, ingredients, category, image_url, vendor_id)
VALUES
(
  '44444444-dddd-4444-4444-444444444444',
  'Ceylon Passion & Old Reserve Arrack Sour',
  'Botanik Bistro & Rooftop',
  'Colombo',
  2800,
  'Aged Ceylon Coconut Arrack, fresh local passionfruit nectar, hand-scraped Ceylon cinnamon infusion, egg white froth and Angostura drops.',
  ARRAY['Ceylon Arrack 100% Coconut', 'Passionfruit Puree', 'Ceylon Cinnamon Syrup', 'Citrus', 'Egg White'],
  'Signature Cocktail',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  'd4444444-4444-4444-4444-444444444444'
),
(
  '55555555-eeee-5555-5555-555555555555',
  'Mirissa Sunset Smoked Chili Margarita',
  'Weligama Beach Club',
  'Mirissa',
  3200,
  'Olmeca Reposado tequila shaken with charred bird’s eye chili, fresh Jaffna lime, smoked agave, and sea salt rim.',
  ARRAY['Tequila Reposado', 'Cointreau', 'Jaffna Lime', 'Smoked Kochchi Chili', 'Himalayan Salt'],
  'Signature Cocktail',
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
  'd4444444-4444-4444-4444-444444444444'
),
(
  '66666666-aaaa-6666-6666-666666666666',
  'Crispy Negombo Lagoon Crab Croquettes',
  'Botanik Bistro & Rooftop',
  'Colombo',
  3600,
  'Hand-picked Negombo crab meat folded with spiced potato and curry leaf emulsion, served with tamarind aioli.',
  ARRAY['Fresh Lagoon Crab', 'Curry Leaf Dust', 'Panko Crumb', 'Spiced Tamarind Aioli'],
  'Tapas & Bites',
  'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
  'd4444444-4444-4444-4444-444444444444'
),
(
  '77777777-bbbb-7777-7777-777777777777',
  'Kandy Queen Rose Gin Fizz',
  'The Vault 07',
  'Colombo',
  2600,
  'Colombo No. 7 Gin infused with organic Damask rose petal syrup, lemongrass essence, cucumber ribbons, and elderflower tonic.',
  ARRAY['Colombo No. 7 Gin', 'Rose Cordial', 'Lemongrass', 'Fever-Tree Tonic', 'Fresh Cucumber'],
  'Signature Cocktail',
  'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
  'd4444444-4444-4444-4444-444444444444'
)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  price_lkr = EXCLUDED.price_lkr,
  description = EXCLUDED.description,
  name = EXCLUDED.name,
  ingredients = EXCLUDED.ingredients,
  category = EXCLUDED.category;

-- 15. INITIAL 2-HOUR EVENT REMINDER ALERT
INSERT INTO public.notifications (id, user_id, event_id, type, title, message, is_read, scheduled_for, created_at)
VALUES
(
  '70000000-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  '11111111-aaaa-1111-1111-111111111111',
  'event_reminder_2h',
  '⏰ Party Starts in Under 2 Hours!',
  'Your RSVP for "Skyline Euphoria: Lotus Vista Sessions" at Botanik Bistro & Rooftop is coming up. Dress code: Chic / Cocktail. Your VIP guest pass is active!',
  false,
  NOW() + INTERVAL '1 hour 45 minutes',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
`;
