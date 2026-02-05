import { createClient } from "@supabase/supabase-js";
import { env } from "@tatame-monorepo/env/server";
import type { StripeCustomerMapping, StripeWebhookEvent } from "./types";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseService = {
  /**
   * Get Stripe customer ID for a given Clerk user ID
   */
  async getStripeCustomerByClerkId(
    clerkUserId: string,
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("stripe_customer_mapping")
      .select("stripe_customer_id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data?.stripe_customer_id || null;
  },

  /**
   * Create or update Stripe customer mapping
   */
  async upsertStripeCustomerMapping(
    mapping: Omit<StripeCustomerMapping, "id" | "created_at" | "updated_at">,
  ): Promise<StripeCustomerMapping> {
    const { data, error } = await supabase
      .from("stripe_customer_mapping")
      .upsert(
        {
          user_id: mapping.user_id,
          clerk_user_id: mapping.clerk_user_id,
          stripe_customer_id: mapping.stripe_customer_id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "clerk_user_id",
        },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Check if a Stripe customer mapping exists
   */
  async hasStripeCustomerMapping(clerkUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("stripe_customer_mapping")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      throw error;
    }

    return !!data;
  },

  /**
   * Check if a webhook event has already been processed
   */
  async isWebhookEventProcessed(stripeEventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .select("id")
      .eq("stripe_event_id", stripeEventId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - event not processed yet
        return false;
      }
      throw error;
    }

    return !!data;
  },

  /**
   * Mark a webhook event as processed
   */
  async markWebhookEventProcessed(
    stripeEventId: string,
    eventType: string,
  ): Promise<StripeWebhookEvent> {
    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .insert({
        stripe_event_id: stripeEventId,
        event_type: eventType,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
