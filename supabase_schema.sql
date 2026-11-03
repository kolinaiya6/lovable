-- ==============================================================================
-- LOVABLE LK (loveablelk) — SRI LANKA NIGHTLIFE, DATING & COMPANION PLATFORM
-- COMPLETE PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH AUTH, RLS, STORAGE & REALTIME
-- Target Project URL: https://gmtzbwgbgodrfzvmlimd.supabase.co
-- Official PayPal Integration: App Name: loveablelk
-- PayPal Client ID: BAAODoQ_pB0IEsLcrGCgzPUP3l7JYmzIBeKzdFJGuO4kln0otkP_MPJtValS7AxgUZ3f4wFCR-uyD_xNoc
-- Pricing: $16.50 USD / Month (Unlimited Nightlife Parties, Guestlists & Cocktails)
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/gmtzbwgbgodrfzvmlimd/sql
-- 2. Click "New Query", paste this entire script, and click "Run".
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROFILES TABLE (Partygoers, Verified Companions, Club Owners & Super Admin)
-- ==============================================================================
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
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'trial')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  subscription_tier TEXT DEFAULT 'Monthly Vendor Pass',
  preferred_gateway TEXT DEFAULT 'PAYPAL' CHECK (preferred_gateway IN ('PAYHERE', 'PAYPAL')),
  deletion_requested BOOLEAN DEFAULT false,
  deletion_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely ensure subscription columns exist if table was already created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_expires_at') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT DEFAULT 'Monthly Vendor Pass';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'preferred_gateway') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_gateway TEXT DEFAULT 'PAYPAL';
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

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

-- ==============================================================================
-- 3. EVENTS TABLE (Raves, Rooftops, Sunset Beach Parties, VIP Lounges)
-- ==============================================================================
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

-- ==============================================================================
-- 4. SIGNATURE COCKTAILS & TAPAS (Nightclub / Bar Mixology Menus)
-- ==============================================================================
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

-- ==============================================================================
-- 5. REALTIME CHAT MESSAGES
-- ==============================================================================
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

-- ==============================================================================
-- 6. AUTOMATED NOTIFICATIONS & 2-HOUR EVENT RADAR ALERTS
-- ==============================================================================
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

-- ==============================================================================
-- 7. MUTUAL DATING MATCHES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_like BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- ==============================================================================
-- 8. LOVE & FRIEND REQUESTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- ==============================================================================
-- 9. SAVED / BOOKMARKED EVENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- ==============================================================================
-- 10. CONTENT MODERATION REPORTS (Zero-Tolerance Safety)
-- ==============================================================================
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

-- ==============================================================================
-- 11. PAYMENTS LEDGER (Official PayPal Integration for loveablelk)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_usd NUMERIC NOT NULL DEFAULT 16.50,
  amount_lkr NUMERIC NOT NULL DEFAULT 5000,
  currency TEXT NOT NULL DEFAULT 'USD',
  plan TEXT NOT NULL DEFAULT '1 Month VIP Vendor Pass',
  payment_gateway TEXT NOT NULL DEFAULT 'PAYPAL' CHECK (payment_gateway IN ('PAYPAL', 'PAYHERE')),
  gateway_order_id TEXT NOT NULL,
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  paypal_payer_id TEXT,
  paypal_payer_email TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  months_added INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely ensure columns exist on payments if table already created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'amount_usd') THEN
    ALTER TABLE public.payments ADD COLUMN amount_usd NUMERIC DEFAULT 16.50;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'currency') THEN
    ALTER TABLE public.payments ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'paypal_order_id') THEN
    ALTER TABLE public.payments ADD COLUMN paypal_order_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'paypal_capture_id') THEN
    ALTER TABLE public.payments ADD COLUMN paypal_capture_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'paypal_payer_id') THEN
    ALTER TABLE public.payments ADD COLUMN paypal_payer_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'paypal_payer_email') THEN
    ALTER TABLE public.payments ADD COLUMN paypal_payer_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'months_added') THEN
    ALTER TABLE public.payments ADD COLUMN months_added INTEGER DEFAULT 1;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 12. BLOCKED USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- ==============================================================================
-- 13. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_cocktails_city ON public.cocktails(city);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON public.payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_matches_pair ON public.matches(user1_id, user2_id);

-- ==============================================================================
-- 14. STORED PROCEDURES & SUBSCRIPTION ACTIVATION
-- ==============================================================================

-- Unified Payment Activation Function for PAYPAL and PAYHERE
CREATE OR REPLACE FUNCTION public.activate_vendor_subscription(
  p_vendor_id UUID,
  p_order_id TEXT,
  p_gateway TEXT DEFAULT 'PAYPAL',
  p_amount NUMERIC DEFAULT 5000,
  p_months INTEGER DEFAULT 1,
  p_currency TEXT DEFAULT 'USD',
  p_paypal_capture_id TEXT DEFAULT NULL,
  p_paypal_payer_id TEXT DEFAULT NULL,
  p_payhere_payment_id TEXT DEFAULT NULL,
  p_md5_sig TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_expiry TIMESTAMP WITH TIME ZONE;
  v_base_time TIMESTAMP WITH TIME ZONE;
  v_new_expiry TIMESTAMP WITH TIME ZONE;
  v_payment_id UUID := uuid_generate_v4();
  v_amount_usd NUMERIC;
  v_amount_lkr NUMERIC;
BEGIN
  -- Determine currency amounts
  IF UPPER(p_gateway) = 'PAYPAL' THEN
    v_amount_usd := COALESCE(p_amount, 16.50);
    v_amount_lkr := v_amount_usd * 300; -- Approx conversion rate
  ELSE
    v_amount_lkr := COALESCE(p_amount, 5000);
    v_amount_usd := ROUND(v_amount_lkr / 300, 2);
  END IF;

  -- 1. Fetch current vendor subscription status
  SELECT COALESCE(subscription_expires_at, trial_ends_at, NOW())
  INTO v_current_expiry
  FROM public.profiles
  WHERE id = p_vendor_id;

  -- 2. Base time is either existing future expiration date or NOW()
  IF v_current_expiry IS NOT NULL AND v_current_expiry > NOW() THEN
    v_base_time := v_current_expiry;
  ELSE
    v_base_time := NOW();
  END IF;

  -- 3. Calculate new expiry (+ N months, 30 days per month)
  v_new_expiry := v_base_time + (COALESCE(p_months, 1) * INTERVAL '30 days');

  -- 4. Update vendor profile with extended subscription
  UPDATE public.profiles
  SET 
    subscription_status = 'active',
    subscription_expires_at = v_new_expiry,
    trial_ends_at = v_new_expiry,
    subscription_tier = 'Monthly Vendor Pass',
    preferred_gateway = UPPER(p_gateway),
    updated_at = NOW()
  WHERE id = p_vendor_id;

  -- 5. Record payment in payments ledger
  INSERT INTO public.payments (
    id, vendor_id, amount_lkr, amount_usd, currency, plan, payment_gateway,
    gateway_order_id, paypal_order_id, paypal_capture_id, paypal_payer_id,
    payhere_payment_id, md5_sig, status, valid_until, months_added, created_at
  )
  VALUES (
    v_payment_id,
    p_vendor_id,
    v_amount_lkr,
    v_amount_usd,
    COALESCE(p_currency, CASE WHEN UPPER(p_gateway) = 'PAYPAL' THEN 'USD' ELSE 'LKR' END),
    COALESCE(p_months, 1) || ' Month Party Pass',
    UPPER(p_gateway),
    p_order_id,
    CASE WHEN UPPER(p_gateway) = 'PAYPAL' THEN p_order_id ELSE NULL END,
    p_paypal_capture_id,
    p_paypal_payer_id,
    p_payhere_payment_id,
    p_md5_sig,
    'COMPLETED',
    v_new_expiry,
    COALESCE(p_months, 1),
    NOW()
  );

  -- 6. Insert notification for vendor
  INSERT INTO public.notifications (
    id, user_id, type, title, message, is_read, created_at
  )
  VALUES (
    uuid_generate_v4(),
    p_vendor_id,
    'vip_announcement',
    CASE 
      WHEN UPPER(p_gateway) = 'PAYPAL' THEN '🎉 PayPal Vendor Pass Activated!'
      ELSE '🎉 PayHere Vendor Pass Activated!'
    END,
    'Your party publishing pass has been renewed for ' || COALESCE(p_months, 1) || ' month(s). You can now create unlimited party events and manage cocktails until ' || to_char(v_new_expiry, 'YYYY-MM-DD') || '.',
    false,
    NOW()
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'payment_id', v_payment_id,
    'gateway', UPPER(p_gateway),
    'order_id', p_order_id,
    'months_added', COALESCE(p_months, 1),
    'valid_until', v_new_expiry
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$;

-- Backward-compatible alias for PayHere
CREATE OR REPLACE FUNCTION public.activate_payhere_subscription(
  p_vendor_id UUID,
  p_order_id TEXT,
  p_amount NUMERIC DEFAULT 5000,
  p_months INTEGER DEFAULT 1,
  p_payhere_payment_id TEXT DEFAULT NULL,
  p_md5_sig TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN public.activate_vendor_subscription(
    p_vendor_id,
    p_order_id,
    'PAYHERE',
    p_amount,
    p_months,
    'LKR',
    NULL,
    NULL,
    p_payhere_payment_id,
    p_md5_sig
  );
END;
$$;

-- Stored Function: Check if user can create party or cocktail
CREATE OR REPLACE FUNCTION public.can_create_party_or_asset(p_user_id UUID)
RETURNS BOOLEAN
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role TEXT;
  v_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT role, GREATEST(COALESCE(subscription_expires_at, '1970-01-01'::timestamptz), COALESCE(trial_ends_at, '1970-01-01'::timestamptz))
  INTO v_role, v_expiry
  FROM public.profiles
  WHERE id = p_user_id;

  -- Super admin always has access
  IF v_role = 'admin' THEN
    RETURN true;
  END IF;

  -- Active subscription or within 30-day trial
  IF v_expiry IS NOT NULL AND v_expiry > NOW() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Automated 2-Hour Pre-Event Reminder Generator
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
-- 15. PERMISSIONS & ROLES (Ensures anon and authenticated users can read/write)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
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
-- 17. AUTOMATIC REGISTRATION TRIGGER (auth.users -> public.profiles synchronization)
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
    subscription_status,
    subscription_expires_at,
    subscription_tier,
    preferred_gateway,
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
    'active',
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'vendor' THEN NOW() + INTERVAL '30 days'
      ELSE NULL
    END,
    'Monthly Vendor Pass',
    'PAYPAL',
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
-- 18. STORAGE BUCKETS (Avatars, Venue Covers, Event Flyers & Cocktails)
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
-- 19. REALTIME REPLICATION (Instant Chat, Events, Cocktails, Notifications & Payments)
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
-- 20. PRODUCTION LOGINS & SEED ACCOUNTS (auth.users + public.profiles)
-- 1. Super Admin: kolinaiya6@gmail.com  | Password: 19880408@#
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
    'kolinaiya6@gmail.com', crypt('19880408@#', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin Kolin","role":"admin","city":"Colombo"}',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('19880408@#', gen_salt('bf')),
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
INSERT INTO public.profiles (id, email, password_hash, name, age, role, is_companion, companion_headline, companion_rate, city, distance_km, bio, looking_for, interests, avatar_url, photos, is_verified, is_online, preferred_gateway)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'kolinaiya6@gmail.com',
  '19880408@#',
  'Admin Kolin',
  32,
  'admin',
  false,
  NULL,
  NULL,
  'Colombo',
  1.5,
  'Platform Administrator & Nightlife Curator for Lovable LK (loveablelk). Ensuring verified, safe, and elite nightlife experiences across Sri Lanka.',
  'Platform Master Operations & VIP Networking',
  ARRAY['VIP Lounges', 'Deep House', 'Mixology', 'Travel'],
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'],
  true,
  true,
  'PAYPAL'
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
  true,
  'PAYPAL'
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
  true,
  'PAYPAL'
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
  true,
  'PAYPAL'
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
  true,
  'PAYPAL'
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
  true,
  'PAYPAL'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- ==============================================================================
-- 21. INITIAL EVENTS (With starts_at for automated 2-hour pre-event reminder tests)
-- ==============================================================================
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

-- ==============================================================================
-- 22. INITIAL SIGNATURE COCKTAILS & TAPAS
-- ==============================================================================
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

-- ==============================================================================
-- 23. INITIAL COMPLETED PAYMENTS (PAYPAL & PAYHERE)
-- ==============================================================================
INSERT INTO public.payments (id, vendor_id, amount_lkr, amount_usd, currency, plan, payment_gateway, gateway_order_id, paypal_order_id, status, valid_until, months_added, created_at)
VALUES
(
  '80000000-1111-1111-1111-111111111111',
  'd4444444-4444-4444-4444-444444444444',
  5000,
  16.50,
  'USD',
  '1 Month Party Pass',
  'PAYPAL',
  'PAYPAL-CAPTURE-1730000000',
  'BAAODoQ_pB0IEsLcrGCgzPUP3l7JYmzIBeKzdFJGuO4kln0otkP_MPJtValS7AxgUZ3f4wFCR-uyD_xNoc',
  'COMPLETED',
  NOW() + INTERVAL '30 days',
  1,
  NOW()
),
(
  '80000000-2222-2222-2222-222222222222',
  'd4444444-4444-4444-4444-444444444444',
  5000,
  16.50,
  'LKR',
  '1 Month Party Pass',
  'PAYHERE',
  'PAYHERE-SUB-1730000000',
  NULL,
  'COMPLETED',
  NOW() + INTERVAL '30 days',
  1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  valid_until = EXCLUDED.valid_until;
