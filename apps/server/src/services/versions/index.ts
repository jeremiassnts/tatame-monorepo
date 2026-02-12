import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";

export class VersionsService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }

    async get() {
        const { data, error } = await this.supabase.from("versions")
            .select("*")
            .is("disabled_at", null)
            .limit(1);

        if (error) {
            throw error;
        }
        return data[0];
    }
}