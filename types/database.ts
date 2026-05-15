export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }

      clients: {
        Row: {
          id: string
          agency_id: string
          name: string
          whatsapp_number: string
          plan: 'starter' | 'pro'
          meta_pixel_id: string | null
          meta_access_token: string | null
          client_token: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          name: string
          whatsapp_number: string
          plan?: 'starter' | 'pro'
          meta_pixel_id?: string | null
          meta_access_token?: string | null
          client_token?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          whatsapp_number?: string
          plan?: 'starter' | 'pro'
          meta_pixel_id?: string | null
          meta_access_token?: string | null
          client_token?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }

      tracking_links: {
        Row: {
          id: string
          client_id: string
          slug: string
          utm_source: 'meta' | 'google' | 'bio' | 'organico' | 'outro'
          utm_campaign: string
          utm_medium: string
          utm_content: string | null
          destination_text: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          slug: string
          utm_source: 'meta' | 'google' | 'bio' | 'organico' | 'outro'
          utm_campaign: string
          utm_medium?: string
          utm_content?: string | null
          destination_text: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          slug?: string
          utm_source?: 'meta' | 'google' | 'bio' | 'organico' | 'outro'
          utm_campaign?: string
          utm_medium?: string
          utm_content?: string | null
          destination_text?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tracking_links_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }

      click_events: {
        Row: {
          id: string
          tracking_link_id: string
          client_id: string
          session_id: string
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          fbclid: string | null
          gclid: string | null
          capi_sent: boolean
          capi_sent_at: string | null
          clicked_at: string
        }
        Insert: {
          id?: string
          tracking_link_id: string
          client_id: string
          session_id: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          fbclid?: string | null
          gclid?: string | null
          capi_sent?: boolean
          capi_sent_at?: string | null
          clicked_at?: string
        }
        Update: {
          id?: string
          tracking_link_id?: string
          client_id?: string
          session_id?: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          fbclid?: string | null
          gclid?: string | null
          capi_sent?: boolean
          capi_sent_at?: string | null
          clicked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'click_events_tracking_link_id_fkey'
            columns: ['tracking_link_id']
            isOneToOne: false
            referencedRelation: 'tracking_links'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'click_events_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }
    }

    Views: {
      daily_clicks_by_source: {
        Row: {
          client_id: string
          date: string
          utm_source: string
          total_clicks: number
        }
        Relationships: []
      }
    }

    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ---------------------------------------------------------------------------
// Generic helpers (mirror the Supabase CLI codegen pattern)
// ---------------------------------------------------------------------------

/** Full row type for a table. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/** Insert payload type for a table (all optional-at-DB fields are optional). */
export type Insert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

/** Partial update payload type for a table. */
export type Update<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

/** Row type for a view. */
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

// ---------------------------------------------------------------------------
// Convenience aliases
// ---------------------------------------------------------------------------

export type Agency        = Tables<'agencies'>
export type Client        = Tables<'clients'>
export type TrackingLink  = Tables<'tracking_links'>
export type ClickEvent    = Tables<'click_events'>
export type DailyClickRow = Views<'daily_clicks_by_source'>

export type AgencyInsert       = Insert<'agencies'>
export type ClientInsert       = Insert<'clients'>
export type TrackingLinkInsert = Insert<'tracking_links'>
export type ClickEventInsert   = Insert<'click_events'>

export type AgencyUpdate       = Update<'agencies'>
export type ClientUpdate       = Update<'clients'>
export type TrackingLinkUpdate = Update<'tracking_links'>
export type ClickEventUpdate   = Update<'click_events'>
