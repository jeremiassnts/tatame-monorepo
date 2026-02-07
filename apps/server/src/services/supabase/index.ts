import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@tatame-monorepo/env/server";

export class SupabaseService {
  private supabase: SupabaseClient;
  constructor(accessToken: string) {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      accessToken: async () => accessToken,
    });
  }
  /**
 * Update user
 */
  async updateUser(data: Record<string, unknown>) {
    const { error } = await this.supabase
      .from("users")
      .update(data)
      .eq("id", data.id);
    if (error) {
      throw error;
    }
  }
}