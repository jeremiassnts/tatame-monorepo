import { BELT_ORDER } from "@/constants/belt";
import type { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { NotificationsService } from "../notifications";
import { RolesService } from "../roles";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class UsersService {
    private supabase: SupabaseClient;
    private rolesService: RolesService;
    private notificationsService: NotificationsService;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
        this.rolesService = new RolesService(accessToken);
        this.notificationsService = new NotificationsService(accessToken);
    }

    async create(clerkUserId: string, role: string, email: string, firstName: string, lastName: string, profilePicture: string) {
        const { data, error } = await this.supabase.from("users").insert({
            clerk_user_id: clerkUserId,
            role: role,
            email: email,
            first_name: firstName,
            last_name: lastName,
            profile_picture: profilePicture,
            approved_at: this.rolesService.isHigherRole(role) ? new Date().toISOString() : null,
            migrated_at: new Date().toISOString(),
        });
        if (error) {
            throw error;
        }

        return data;
    }

    async get(userId: number) {
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", userId);
        if (error) {
            throw error;
        }
        return data[0];
    };

    async getByClerkUserId(clerkUserId: string) {
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("clerk_user_id", clerkUserId);
        if (error) {
            throw error;
        }
        return data[0];
    };

    async listStudentsByGymId(gymId: number) {
        const { data, error } = await this.supabase
            .from("users")
            .select("*, graduations(belt, degree)")
            .eq("gym_id", gymId);

        if (error) {
            throw error;
        }
        return data.sort((a, b) => {
            if (a.belt === b.belt) {
                if (a.degree === b.degree) {
                    return a.name.localeCompare(b.name);
                }
                return b.degree! - a.degree!;
            }
            //@ts-ignore
            return BELT_ORDER[a.belt] - BELT_ORDER[b.belt];
        });
    }

    async approveStudent(userId: number) {
        const { error } = await this.supabase
            .from("users")
            .update({ approved_at: new Date().toISOString(), denied_at: null })
            .eq("id", userId);
        if (error) {
            throw error;
        }

        await this.notificationsService.create({
            title: "Parabéns! Seu cadastro foi aprovado",
            content: `Aproveite, agora você pode acessar todos os recursos da plataforma!`,
            recipients: [userId.toString()],
            channel: "push",
            status: "pending",
            viewed_by: [],
        });
    }

    async denyStudent(userId: number) {
        const { error } = await this.supabase
            .from("users")
            .update({ denied_at: new Date().toISOString(), approved_at: null })
            .eq("id", userId);
        if (error) {
            throw error;
        }

        await this.notificationsService.create({
            title: "Que pena! Seu cadastro foi negado",
            content: `Por favor, contate o suporte para mais informações`,
            recipients: [userId.toString()],
            channel: "push",
            status: "pending",
            viewed_by: [],
        });
    }

    async getStudentsApprovalStatus(userId: number) {
        const role = await this.rolesService.getRoleByUserId(userId);
        if (this.rolesService.isHigherRole(role)) {
            return true;
        }
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", userId);

        if (error) {
            throw error;
        }

        return data[0].approved_at && !data[0].denied_at;
    }

    async update(data: Database["public"]["Tables"]["users"]["Update"]) {
        const { error } = await this.supabase
            .from("users")
            .update(data)
            .eq("id", data.id);
        if (error) {
            throw error;
        }
    }

    async delete(userId: string) {
        const { error } = await this.supabase
            .from("users")
            .update({
                deleted_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (error) {
            throw error;
        }
    }

    async getBirthdayUsers(date: string) {
        const formatted = format(new Date(), "MM-dd");
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("birth_day", formatted);

        if (error) {
            throw error;
        }

        return (data as Database["public"]["Tables"]["users"]["Row"][]).sort(
            (a, b) => {
                return (a.first_name ?? "").localeCompare(b.first_name ?? "");
            },
        );
    }

    async listInstructorsByGymId(gymId: number) {
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("gym_id", gymId)
            .or(
                "role.eq.MANAGER,and(role.eq.INSTRUCTOR,approved_at.not.is.null)",
            );

        if (error) {
            throw error;
        }

        return data
    }
}