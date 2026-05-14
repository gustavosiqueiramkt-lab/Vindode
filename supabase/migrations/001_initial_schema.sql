-- ============================================================
-- 001_initial_schema.sql
-- WhatsApp Ad Click Tracker — initial schema
--
-- Access model (summary):
--   authenticated role  → agency users logged in via Supabase Auth
--   anon role           → client read-only access using a custom JWT
--                         that carries the claim { "client_token": "<value>" }
--   service_role        → Edge Function redirect (bypasses all RLS)
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE agencies (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         uuid        NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name              text        NOT NULL,
  whatsapp_number   text        NOT NULL,                          -- format: 5511999999999
  plan              text        NOT NULL DEFAULT 'starter'
                                CHECK (plan IN ('starter', 'pro')),
  meta_pixel_id     text,
  meta_access_token text,                                          -- encrypt at application layer before storing
  client_token      text        UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tracking_links (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  slug             text        UNIQUE NOT NULL,                    -- 8-char alphanumeric, e.g. "ab3x91kz"
  utm_source       text        NOT NULL
                               CHECK (utm_source IN ('meta', 'google', 'bio', 'organico', 'outro')),
  utm_campaign     text        NOT NULL,
  utm_medium       text        NOT NULL DEFAULT 'cpc',
  utm_content      text,
  destination_text text        NOT NULL,                          -- pre-filled WhatsApp message text
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE click_events (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id uuid        NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  client_id        uuid        NOT NULL REFERENCES clients(id) ON DELETE CASCADE, -- denormalized for dashboard queries
  session_id       text        NOT NULL,                          -- UUID generated at click time
  ip_address       text,
  user_agent       text,
  referrer         text,
  fbclid           text,                                          -- Meta Ads click identifier
  gclid            text,                                          -- Google Ads click identifier
  capi_sent        boolean     NOT NULL DEFAULT false,
  capi_sent_at     timestamptz,
  clicked_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

-- Dashboard queries: client timeline scan
CREATE INDEX idx_click_events_client_date
  ON click_events (client_id, clicked_at DESC);

-- Per-link performance report
CREATE INDEX idx_click_events_link_date
  ON click_events (tracking_link_id, clicked_at DESC);

-- Global temporal range queries
CREATE INDEX idx_click_events_date
  ON click_events (clicked_at DESC);

-- Redirect lookup — latency-critical path in the Edge Function
CREATE INDEX idx_tracking_links_slug
  ON tracking_links (slug);

-- Dashboard: list links per client
CREATE INDEX idx_tracking_links_client
  ON tracking_links (client_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE agencies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_events   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies — agencies
-- ============================================================

-- Agencies are linked to Supabase Auth users by matching the JWT email claim.
-- The sign-up flow must create an agencies row with the same email as auth.users.

-- Agency reads its own row
CREATE POLICY "agencies: agency reads own row"
  ON agencies FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Agency inserts its own row on sign-up (email must match caller's JWT)
CREATE POLICY "agencies: agency inserts own row"
  ON agencies FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.jwt() ->> 'email');

-- Agency updates its own row
CREATE POLICY "agencies: agency updates own row"
  ON agencies FOR UPDATE
  TO authenticated
  USING     (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- ============================================================
-- RLS Policies — clients
-- ============================================================

-- Prevents an agency from reading clients that belong to a different agency
CREATE POLICY "clients: agency reads own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id    = clients.agency_id
        AND agencies.email = auth.jwt() ->> 'email'
    )
  );

-- Prevents an agency from inserting a client under a foreign agency_id
CREATE POLICY "clients: agency inserts clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id    = clients.agency_id
        AND agencies.email = auth.jwt() ->> 'email'
    )
  );

-- Prevents an agency from updating a client that belongs to another agency
CREATE POLICY "clients: agency updates own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id    = clients.agency_id
        AND agencies.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id    = clients.agency_id
        AND agencies.email = auth.jwt() ->> 'email'
    )
  );

-- Prevents an agency from deleting a client that belongs to another agency
CREATE POLICY "clients: agency deletes own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies
      WHERE agencies.id    = clients.agency_id
        AND agencies.email = auth.jwt() ->> 'email'
    )
  );

-- Client reads only their own row using the token embedded in the anon JWT claim
-- Frontend must use: supabase.auth.signInAnonymously() + custom JWT with { client_token: "..." }
CREATE POLICY "clients: client reads own row via token"
  ON clients FOR SELECT
  TO anon
  USING (client_token = auth.jwt() ->> 'client_token');

-- ============================================================
-- RLS Policies — tracking_links
-- ============================================================

-- Agency reads only tracking links that belong to their clients
CREATE POLICY "tracking_links: agency reads own"
  ON tracking_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN   agencies a ON a.id = c.agency_id
      WHERE  c.id    = tracking_links.client_id
        AND  a.email = auth.jwt() ->> 'email'
    )
  );

-- Agency creates links only for clients that belong to their agency
CREATE POLICY "tracking_links: agency inserts"
  ON tracking_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN   agencies a ON a.id = c.agency_id
      WHERE  c.id    = tracking_links.client_id
        AND  a.email = auth.jwt() ->> 'email'
    )
  );

-- Agency updates only links belonging to their clients
CREATE POLICY "tracking_links: agency updates"
  ON tracking_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN   agencies a ON a.id = c.agency_id
      WHERE  c.id    = tracking_links.client_id
        AND  a.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN   agencies a ON a.id = c.agency_id
      WHERE  c.id    = tracking_links.client_id
        AND  a.email = auth.jwt() ->> 'email'
    )
  );

-- Agency deletes only links belonging to their clients
CREATE POLICY "tracking_links: agency deletes"
  ON tracking_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN   agencies a ON a.id = c.agency_id
      WHERE  c.id    = tracking_links.client_id
        AND  a.email = auth.jwt() ->> 'email'
    )
  );

-- Client reads only their own tracking links (read-only dashboard)
CREATE POLICY "tracking_links: client reads own via token"
  ON tracking_links FOR SELECT
  TO anon
  USING (
    client_id = (
      SELECT id FROM clients
      WHERE  client_token = auth.jwt() ->> 'client_token'
    )
  );

-- ============================================================
-- RLS Policies — click_events
-- ============================================================

-- Agency reads click events for all of their clients
CREATE POLICY "click_events: agency reads own"
  ON click_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN   agencies a ON a.id = c.agency_id
      WHERE  c.id    = click_events.client_id
        AND  a.email = auth.jwt() ->> 'email'
    )
  );

-- Client reads only their own click events (read-only dashboard)
CREATE POLICY "click_events: client reads own via token"
  ON click_events FOR SELECT
  TO anon
  USING (
    client_id = (
      SELECT id FROM clients
      WHERE  client_token = auth.jwt() ->> 'client_token'
    )
  );

-- INSERT and UPDATE are intentionally unrestricted here because no PERMISSIVE
-- policy exists for those operations on authenticated/anon roles — RLS denies
-- them by default. The redirect Edge Function uses service_role key, which
-- bypasses RLS entirely and is the sole writer of click_events rows.

-- ============================================================
-- Views
-- ============================================================

-- Aggregates daily clicks grouped by client, calendar day, and UTM source.
-- SECURITY INVOKER propagates the caller's RLS context into the underlying
-- tables, so an agency sees only their clients' data and a client with a
-- token sees only their own data.
CREATE VIEW daily_clicks_by_source
  WITH (security_invoker = on) AS
SELECT
  ce.client_id,
  date_trunc('day', ce.clicked_at)::date AS date,
  tl.utm_source,
  count(*)::bigint                        AS total_clicks
FROM  click_events   ce
JOIN  tracking_links tl ON tl.id = ce.tracking_link_id
GROUP BY ce.client_id, date_trunc('day', ce.clicked_at), tl.utm_source;
