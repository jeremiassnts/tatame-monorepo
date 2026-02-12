import type { SupabaseClient } from "@supabase/supabase-js";
import { subDays } from "date-fns";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class CheckinsService {
    private supabase: SupabaseClient;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
    }
    /**
     * Create a checkin
     */
    async create(checkin: Database["public"]["Tables"]["checkins"]["Insert"]) {
        //verify if the user has already checked in for this class
        const { data: checkinData } = await this.supabase
            .from("checkins")
            .select("*")
            .eq("classId", checkin.classId)
            .eq("userId", checkin.userId);
        if (checkinData && checkinData.length > 0) {
            return;
        }
        const { error } = await this.supabase.from("checkins").insert(checkin);
        if (error) {
            throw error;
        }
    }
    /**
     * Delete a checkin
     */
    async delete(checkinId: number) {
        const { data, error } = await this.supabase.from("checkins").delete().eq("id", checkinId);
        if (error) {
            throw error;
        }
        return data;
    }
    /**
     * List checkins by user id
     */
    async listByUserId(userId: number) {
        const { data, error } = await this.supabase.from("checkins")
            .select("*")
            .eq("usersId", userId)
            .eq("date", new Date().toISOString());

        if (error) {
            throw error;
        }
        return data;
    }
    /**
     * List checkins by class id
     */
    async listByClassIdAndUserId(classId: number, userId: number) {
        const { data, error } = await this.supabase
            .from("checkins")
            .select("*")
            .eq("userId", userId)
            .eq("date", new Date().toISOString())
            .eq("classId", classId);

        if (error) {
            throw error;
        }

        return data;
    }
    /*
        * List last checkins
    */
    async listLastCheckinsByUserId(userId: number) {
        const { data, error } = await this.supabase
            .from("checkins")
            .select("*")
            .eq("userId", userId)
            .gte("date", subDays(new Date(), 15).toISOString())
            .lte("date", new Date().toISOString());

        if (error) {
            console.error(error);
            throw error;
        }

        return data;
    }
    /**
     * List checkins by class id
     */
    async listByClassId(classId: number) {
        const { data, error } = await this.supabase
            .from("checkins")
            .select("*, users(first_name, last_name, profile_picture)")
            .eq("classId", classId)
            .eq("date", new Date().toISOString());
        if (error) {
            throw error;
        }

        return data.map((checkin) => {
            return {
                ...checkin,
                name: (
                    (checkin.users?.first_name ?? "") +
                    " " +
                    (checkin.users?.last_name ?? "")
                ).trim(),
                imageUrl: checkin.users?.profile_picture ?? "",
            };
        });
    }
    /**
     * List last month checkins by user id
     */
    async listLastMonthCheckinsByUserId(userId: number) {
        const { data, error } = await this.supabase
            .from("checkins")
            .select(
                "*, class!inner(id, start, end, day)",
            )
            .eq("userId", userId)
            .gte("date", subDays(new Date(), 30).toISOString())
            .lte("date", new Date().toISOString())
            .order("date", { ascending: false });

        if (error) {
            console.error(error);
            throw error;
        }

        return data
    }
}