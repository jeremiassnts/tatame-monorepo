import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase";

export class RolesService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }
    /*
    Get a role by user id
    */
    async getRoleByUserId(userId: number) {
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", userId);
        if (error) {
            throw error;
        }
        return data[0].role;
    };
    /*
    Check the levels of the role
    */
    isHigherRole(role: string) {
        return role === "MANAGER";
    };

    isMediumRole(role: string) {
        return role === "INSTRUCTOR" || role === "MANAGER";
    };

    isLowerRole(role: string) {
        return role === "STUDENT";
    };
}