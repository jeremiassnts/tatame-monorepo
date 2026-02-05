import { createClient } from "@supabase/supabase-js";
import { env } from "@tatame-monorepo/env/server";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface StripeCustomerMapping {
  id?: string;
  user_id: string;
  clerk_user_id: string;
  stripe_customer_id: string;
  created_at?: string;
  updated_at?: string;
}

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
};
