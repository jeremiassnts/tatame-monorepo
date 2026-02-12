import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";

export class AppStoresService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }
    /**
     * Get app stores
     */
    async list() {
        const { data, error } = await this.supabase
            .from("app_stores")
            .select("*")
            .is("disabled_at", null);

        if (error) {
            throw error;
        }
        return data;
    }
}