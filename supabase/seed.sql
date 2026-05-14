-- ============================================================
-- seed.sql — development / local testing data
-- Run after applying migrations: supabase db reset
-- ============================================================

-- ============================================================
-- Agency
-- ============================================================

INSERT INTO agencies (id, name, email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Agência NerdsDev',
  'contato@nerdsdev.com'
);

-- ============================================================
-- Clients
-- ============================================================

-- Client 1: pro plan, has Meta Pixel configured
INSERT INTO clients (
  id, agency_id, name, whatsapp_number, plan,
  meta_pixel_id, meta_access_token, client_token
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Odontologia Sorriso Perfeito',
  '5511991234567',
  'pro',
  '1234567890123456',
  'EAAxxxEncryptedTokenPlaceholderxxx',   -- replace with encrypted value in production
  'token-client-01-sorriso'
);

-- Client 2: starter plan, no Meta Pixel
INSERT INTO clients (
  id, agency_id, name, whatsapp_number, plan,
  client_token
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Clínica Estética Bella',
  '5511987654321',
  'starter',
  'token-client-02-bella'
);

-- ============================================================
-- Tracking Links (3 links for client 1, one per source)
-- ============================================================

-- Meta Ads campaign
INSERT INTO tracking_links (
  id, client_id, slug,
  utm_source, utm_campaign, utm_medium, utm_content,
  destination_text
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'ab3x91kz',
  'meta',
  'implante-dental-maio-2026',
  'cpc',
  'video-implante-30s',
  'Olá! Vi o anúncio do implante dental e gostaria de agendar uma avaliação gratuita.'
);

-- Google Ads campaign
INSERT INTO tracking_links (
  id, client_id, slug,
  utm_source, utm_campaign, utm_medium, utm_content,
  destination_text
)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'cd7y28mw',
  'google',
  'clareamento-dental-search',
  'cpc',
  'anuncio-texto-clareamento',
  'Olá! Encontrei o consultório no Google e quero saber mais sobre o clareamento dental.'
);

-- Instagram bio link
INSERT INTO tracking_links (
  id, client_id, slug,
  utm_source, utm_campaign, utm_medium, utm_content,
  destination_text
)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'ef5z63np',
  'bio',
  'link-na-bio-instagram',
  'social',
  NULL,
  'Olá! Cliquei no link da bio do Instagram e gostaria de mais informações.'
);

-- ============================================================
-- Click Events — 10 events spread across the last 7 days
-- Distribution: Meta ×5, Google ×3, Bio ×2
-- All events belong to client 1 (Sorriso Perfeito)
-- ============================================================

INSERT INTO click_events (
  id, tracking_link_id, client_id,
  session_id, ip_address, user_agent, referrer,
  fbclid, gclid, capi_sent, capi_sent_at, clicked_at
)
VALUES

  -- ---- day -6 : 2 Meta clicks (capi already sent) ----------

  (
    'cc000000-0000-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '189.32.101.12',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15',
    'https://www.facebook.com/',
    'AbCdEfGhIjKlMnOpQrStUvWxYz_1111111111',
    NULL,
    true,
    now() - interval '6 days' + interval '9 hours 14 minutes',
    now() - interval '6 days' + interval '9 hours'
  ),
  (
    'cc000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '201.45.87.234',
    'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
    'https://www.facebook.com/',
    'XyZaBcDeFgHiJkLmNoPqRsTuVw_2222222222',
    NULL,
    true,
    now() - interval '6 days' + interval '14 hours 7 minutes',
    now() - interval '6 days' + interval '14 hours'
  ),

  -- ---- day -5 : 1 Google click ---------------------------

  (
    'cc000000-0000-0000-0000-000000000003',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '177.66.42.198',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
    'https://www.google.com/',
    NULL,
    'gclid_abc123xyz_3333',
    false,
    NULL,
    now() - interval '5 days' + interval '10 hours'
  ),

  -- ---- day -4 : 1 Meta + 1 Bio ---------------------------

  (
    'cc000000-0000-0000-0000-000000000004',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '192.168.1.50',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5) AppleWebKit/605.1.15',
    'https://www.facebook.com/',
    'MnOpQrStUvWxYzAbCdEfGhIjKl_4444444444',
    NULL,
    false,
    NULL,
    now() - interval '4 days' + interval '8 hours'
  ),
  (
    'cc000000-0000-0000-0000-000000000005',
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '200.158.75.12',
    'Mozilla/5.0 (Linux; Android 12; SM-A325F) AppleWebKit/537.36 Chrome/119.0.0.0',
    'https://www.instagram.com/',
    NULL,
    NULL,
    false,
    NULL,
    now() - interval '4 days' + interval '19 hours'
  ),

  -- ---- day -3 : 2 Google clicks --------------------------

  (
    'cc000000-0000-0000-0000-000000000006',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '131.0.22.105',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0',
    'https://www.google.com/',
    NULL,
    'gclid_def456uvw_6666',
    false,
    NULL,
    now() - interval '3 days' + interval '11 hours'
  ),
  (
    'cc000000-0000-0000-0000-000000000007',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '186.193.4.87',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2) AppleWebKit/605.1.15',
    'https://www.google.com/',
    NULL,
    'gclid_ghi789rst_7777',
    false,
    NULL,
    now() - interval '3 days' + interval '16 hours'
  ),

  -- ---- day -2 : 1 Bio click ------------------------------

  (
    'cc000000-0000-0000-0000-000000000008',
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '187.74.33.90',
    'Mozilla/5.0 (Linux; Android 11; Galaxy A52) AppleWebKit/537.36 Chrome/118.0.0.0',
    'https://www.instagram.com/',
    NULL,
    NULL,
    false,
    NULL,
    now() - interval '2 days' + interval '13 hours'
  ),

  -- ---- day -1 : 1 Meta click -----------------------------

  (
    'cc000000-0000-0000-0000-000000000009',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '170.83.110.26',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3) AppleWebKit/605.1.15',
    'https://www.facebook.com/',
    'QrStUvWxYzAbCdEfGhIjKlMnOp_9999999999',
    NULL,
    false,
    NULL,
    now() - interval '1 day' + interval '10 hours'
  ),

  -- ---- today : 1 Meta click ------------------------------

  (
    'cc000000-0000-0000-0000-000000000010',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    gen_random_uuid()::text,
    '179.56.77.42',
    'Mozilla/5.0 (Android 14; Mobile) AppleWebKit/537.36 Chrome/122.0.0.0',
    'https://www.facebook.com/',
    'VwXyZaBcDeFgHiJkLmNoPqRsTu_0000000000',
    NULL,
    false,
    NULL,
    now() - interval '2 hours'
  );
