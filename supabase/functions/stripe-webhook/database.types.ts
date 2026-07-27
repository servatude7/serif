/**
 * The slice of the generated Supabase schema this function writes to.
 *
 * Edge Functions run on Deno and deploy as a self-contained bundle, so they
 * can't reach `lib/database.types.ts` in the Next.js app. Keep the billing
 * tables below in sync with that file whenever the schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          stripe_customer_id: string | null
          subscription_status: SubscriptionStatus | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          stripe_customer_id?: string | null
          subscription_status?: SubscriptionStatus | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_status?: SubscriptionStatus | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          plan: string
          status: SubscriptionStatus
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          plan?: string
          status: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          stripe_price_id?: string
          plan?: string
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string | null
          stripe_event_id: string
          stripe_event_type: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_invoice_id: string | null
          amount_total: number | null
          currency: string | null
          status: string | null
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          stripe_event_id: string
          stripe_event_type: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_invoice_id?: string | null
          amount_total?: number | null
          currency?: string | null
          status?: string | null
          payload: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          stripe_event_id?: string
          stripe_event_type?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_invoice_id?: string | null
          amount_total?: number | null
          currency?: string | null
          status?: string | null
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: SubscriptionStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
