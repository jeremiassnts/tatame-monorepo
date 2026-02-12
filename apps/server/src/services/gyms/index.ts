import type { SupabaseClient } from "@supabase/supabase-js";
import { NotificationsService } from "../notifications";
import { RolesService } from "../roles";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class GymsService {
    private supabase: SupabaseClient;
    private rolesService: RolesService;
    private notificationsService: NotificationsService;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
        this.rolesService = new RolesService(accessToken);
        this.notificationsService = new NotificationsService(accessToken);
    }
    /*
    Create a gym
    */
    async create(gym: Database["public"]["Tables"]["gyms"]["Insert"], userId: number) {
        const { data, error } = await this.supabase.from("gyms").upsert(gym).select();
        if (error || !data) {
            throw error;
        }
        //update the user with the gym_id
        await this.supabase
            .from("users")
            .update({ gym_id: data[0].id })
            .eq("id", userId);

        return data[0];
    }
    /*
    Get a gym by user id
    */
    async getByUserId(userId: number) {
        const { data, error } = await this.supabase
            .from("gyms")
            .select("*")
            .eq("id", userId);
        if (error) {
            throw error;
        }
        return data[0];
    }
    /*
    Get all gyms
    */
    async list() {
        const { data, error } = await this.supabase.from("gyms").select("*");
        if (error) {
            throw error;
        }
        return data;
    }
    /*
        Associate a gym to a user
        */
    async associate(gymId: number, userId: number) {
        const { data, error } = await this.supabase
            .from("users")
            .update({ gym_id: gymId })
            .eq("id", userId)
            .select();
        if (error) {
            throw error;
        }
        const role = await this.rolesService.getRoleByUserId(userId);
        if (!this.rolesService.isHigherRole(role)) {
            const { data: manager } = await this.supabase
                .from("users")
                .select("*")
                .eq("gym_id", gymId)
                .eq("role", "MANAGER");

            await this.notificationsService.create({
                title: "Novo aluno associado a academia",
                content: `Verifique na lista de alunos para aprovar ou negar a associação`,
                recipients: [manager?.[0]?.id.toString()],
                channel: "push",
                status: "pending",
                viewed_by: [data[0].id.toString()],
                sent_by: data[0].id,
            });
        }
    }
}