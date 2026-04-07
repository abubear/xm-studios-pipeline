-- ============================================================
-- SEED DATA — XM Studios AI Production Pipeline
-- ============================================================

-- Create two test users via Supabase auth
-- Password for both: "password123"

-- Admin user
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current,
  phone, phone_change, phone_change_token,
  reauthentication_token, is_sso_user, is_anonymous
) values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@xmstudios.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Alex Chen", "role": "admin"}'::jsonb,
  now(), now(),
  '', '',
  '', '', '',
  null, '', '',
  '', false, false
);

-- Creative Director user
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current,
  phone, phone_change, phone_change_token,
  reauthentication_token, is_sso_user, is_anonymous
) values (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'director@xmstudios.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Sarah Lim", "role": "creative_director"}'::jsonb,
  now(), now(),
  '', '',
  '', '', '',
  null, '', '',
  '', false, false
);

-- Identities for auth (required for email login)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  jsonb_build_object('sub', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'email', 'admin@xmstudios.com'),
  'email',
  now(),
  now(),
  now()
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  jsonb_build_object('sub', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'email', 'director@xmstudios.com'),
  'email',
  now(),
  now(),
  now()
);

-- The on_auth_user_created trigger will auto-create profiles,
-- but we need to ensure the roles are set correctly.
-- Update profiles to correct roles (trigger defaults to the meta role).
-- Profiles should already exist from trigger. If not, insert them:
insert into profiles (id, email, full_name, role)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@xmstudios.com', 'Alex Chen', 'admin'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'director@xmstudios.com', 'Sarah Lim', 'creative_director')
on conflict (id) do update set role = excluded.role;

-- ============================================================
-- IP ROSTER — 5 Characters
-- ============================================================

insert into ip_roster (id, name, universe, description, status, created_by) values
  ('11111111-1111-1111-1111-111111111111', 'Spider-Man', 'Marvel',
   'Peter Parker, the wall-crawling hero. 1:4 scale premium statue featuring dynamic web-slinging pose on a New York City rooftop base.',
   'active', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

  ('22222222-2222-2222-2222-222222222222', 'Batman', 'DC',
   'Bruce Wayne, the Dark Knight. 1:4 scale premium statue featuring cape-spread pose on a Gotham gargoyle base.',
   'active', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),

  ('33333333-3333-3333-3333-333333333333', 'Darth Vader', 'Star Wars',
   'Anakin Skywalker, the Sith Lord. 1:4 scale premium statue featuring Force choke pose with LED-lit lightsaber.',
   'active', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),

  ('44444444-4444-4444-4444-444444444444', 'Wonder Woman', 'DC',
   'Diana Prince, the Amazonian warrior. 1:4 scale premium statue featuring battle stance with Lasso of Truth and shield.',
   'active', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),

  ('55555555-5555-5555-5555-555555555555', 'Iron Man', 'Marvel',
   'Tony Stark in Mark LXXXV armor. 1:4 scale premium statue featuring repulsor blast pose with nano-tech base.',
   'active', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- ============================================================
-- STYLE GUIDE RULES — Marvel
-- ============================================================

insert into style_guide_rules (ip_roster_id, universe, rule, category, severity) values
  (null, 'Marvel', 'Spider-Man''s web pattern must follow the classic Ditko design with consistent geometric spacing', 'costume_accuracy', 'error'),
  (null, 'Marvel', 'All Marvel characters must be depicted in their official current comic book costumes unless specified otherwise by the license', 'costume_accuracy', 'error'),
  (null, 'Marvel', 'Spider-Man''s eye lenses must be white with black outlines — never show pupils or irises', 'facial_features', 'error'),
  (null, 'Marvel', 'Iron Man armor must have correct proportional arc reactor placement at center chest', 'costume_accuracy', 'error'),
  (null, 'Marvel', 'Marvel logo must appear on the base or packaging — never on the character itself', 'branding', 'warning'),
  (null, 'Marvel', 'Muscular definition should match the character''s canonical physique — Spider-Man is lean and athletic, not bulky', 'proportions', 'warning'),
  (null, 'Marvel', 'Color values must match official Marvel style guide hex codes within a 5%% tolerance', 'color', 'error'),
  ('11111111-1111-1111-1111-111111111111', 'Marvel', 'Spider-Man red must be #BE1E2D, blue must be #1B3A6B', 'color', 'error'),
  ('55555555-5555-5555-5555-555555555555', 'Marvel', 'Iron Man Mark LXXXV red must be #8B0000, gold must be #DAA520', 'color', 'error');

-- ============================================================
-- STYLE GUIDE RULES — DC
-- ============================================================

insert into style_guide_rules (ip_roster_id, universe, rule, category, severity) values
  (null, 'DC', 'Batman''s cape must have realistic fabric draping with weighted edges — no stiff or plastic appearance', 'fabric_quality', 'warning'),
  (null, 'DC', 'All DC characters must match the current mainline comic book design unless a specific variant is licensed', 'costume_accuracy', 'error'),
  (null, 'DC', 'Batman''s cowl must have pointed ears of consistent length matching the Jim Lee design proportions', 'costume_accuracy', 'error'),
  (null, 'DC', 'Wonder Woman''s tiara must feature a red star at the center point', 'costume_accuracy', 'error'),
  (null, 'DC', 'Wonder Woman''s Lasso of Truth must appear as a glowing golden rope with visible light emission', 'accessories', 'warning'),
  (null, 'DC', 'DC logo placement follows the same rules as Marvel — on base or packaging only', 'branding', 'warning'),
  (null, 'DC', 'Skin tones must be realistic and consistent — avoid over-saturated or plastic-looking skin', 'color', 'warning'),
  ('22222222-2222-2222-2222-222222222222', 'DC', 'Batman suit must be dark grey #2D2D2D with black #0A0A0A accents, never pure black body', 'color', 'error'),
  ('44444444-4444-4444-4444-444444444444', 'DC', 'Wonder Woman''s armor red must be #B22222, blue must be #191970, gold must be #FFD700', 'color', 'error');

-- ============================================================
-- SAMPLE SESSIONS
-- ============================================================

insert into sessions (id, ip_roster_id, name, stage, status, created_by) values
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Spider-Man Web-Slinger v1', 3, 'active', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Batman Gargoyle Perch v1', 1, 'draft', 'b2c3d4e5-f6a7-8901-bcde-f12345678901'),
  ('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'Darth Vader Throne Room', 5, 'voting', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
