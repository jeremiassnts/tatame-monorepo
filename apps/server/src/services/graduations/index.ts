import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class GraduationsService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }
    /*
        Get a graduation by user id
    */
    async getGraduation(userId: number) {
        const { data, error } = await this.supabase
            .from("graduations")
            .select("*")
            .eq("userId", userId);
        if (error) {
            throw error;
        }
        if (data.length == 0) {
            return null;
        }
        return data[0];
    }
    /*
        Create a graduation
    */
    async create(graduation: Database["public"]["Tables"]["graduations"]["Insert"]) {
        const { data, error } = await this.supabase
            .from("graduations")
            .insert(graduation)
            .select();
        if (error) {
            throw error;
        }
        return data[0];
    }
    /*
        Update a graduation
    */
    async update(graduation: Database["public"]["Tables"]["graduations"]["Update"]) {
        const { error } = await this.supabase.from("graduations").update(graduation).eq("id", graduation.id);
        if (error) {
            throw error;
        }
    }
}