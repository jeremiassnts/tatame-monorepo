import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class AssetsService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }
    /**
     * Create an asset
     */
    async create(asset: Database["public"]["Tables"]["assets"]["Insert"]) {
        const { data, error } = await this.supabase.from("assets").insert(asset);
        if (error) {
            throw error;
        }
        return data;
    }

    /**
     * Delete an asset
     */
    async delete(assetId: number) {
        const { data, error } = await this.supabase.from("assets").delete().eq("id", assetId);
        if (error) {
            throw error;
        }
        return data;
    }

    /**
     * List videos
     */
    async listVideos() {
        const { data, error } = await this.supabase.from("assets")
            .select("*")
            .eq("type", "video")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }
        return data;
    }
}