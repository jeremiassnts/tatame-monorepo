import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, format, isBefore, set } from "date-fns";
import { NotificationsService } from "../notifications";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";

export class ClassService {
    private supabase: SupabaseClient;
    private notificationsService: NotificationsService;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
        this.notificationsService = new NotificationsService(accessToken);
    }

    async nextClass(gymId: number) {
        const { data, error } = await this.supabase
            .from("class")
            .select(
                `
                      *,
                      gym:gyms!gym_id(name),
                      instructor:users!instructor_id(first_name, last_name),
                      assets:assets!class_id(id, content, type, valid_until, created_at, title)
                      `,
            )
            .filter("gym_id", "eq", gymId)
            .filter("deleted_at", "is", null)
            .order("start", { ascending: true });

        if (error) {
            throw error;
        }
        if (data.length === 0) {
            return null;
        }
        let today = new Date();
        let nextClass = null;
        while (!nextClass) {
            const dayOfTheWeek = format(today, "EEEE").toUpperCase();
            for (const item of data) {
                const classTime = set(new Date(), {
                    hours: item.start.split(":")[0],
                    minutes: item.start.split(":")[1],
                    seconds: 0,
                    milliseconds: 0,
                });
                if (
                    item.day === dayOfTheWeek &&
                    isBefore(new Date(), classTime)
                ) {
                    nextClass = item;
                    break;
                }
            }
            today = addDays(today, 1);
        }
        const instructor = (
            (nextClass?.instructor?.first_name ?? "") +
            " " +
            (nextClass?.instructor?.last_name ?? "")
        ).trim();

        return {
            ...nextClass,
            instructor_name: instructor,
        }
    }

    async create(classData: Database["public"]["Tables"]["class"]["Insert"]) {
        const { data, error } = await this.supabase
            .from("class")
            .insert(classData)
            .select();
        if (error) {
            throw error;
        }

        const { data: students } = await this.supabase
            .from("users")
            .select("*")
            .eq("gym_id", classData.gym_id)
            .eq("role", "STUDENT")
            .not("approved_at", "is", null);

        await this.notificationsService.create({
            title: "Nova aula criada",
            content: `Seu professor cadastrou uma nova aula, venha conferir!`,
            recipients: students?.map((student) => student.id.toString()) ?? [],
            channel: "push",
            sent_by: classData.created_by,
            status: "pending",
            viewed_by: [classData.created_by?.toString() ?? ""],
        });

        return data[0];
    }

    async list(gymId: number) {
        const { data, error } = await this.supabase
            .from("class")
            .select(
                `
            *,
            gym:gyms!gym_id(name),
            instructor:users!instructor_id(first_name, last_name),
            assets:assets!class_id(id, content, type, valid_until, created_at, title)
            `,
            )
            .filter("gym_id", "eq", gymId)
            .filter("deleted_at", "is", null)
            .order("start", { ascending: true });

        if (error) {
            throw error;
        }
        //fetching instructors
        return data.map((item) => {
            const instructor = (
                (item.instructor?.first_name ?? "") +
                " " +
                (item.instructor?.last_name ?? "")
            ).trim();
            return {
                ...item,
                instructor_name: instructor,
            }
        });
    }

    async get(classId: number) {
        const { data, error } = await this.supabase
            .from("class")
            .select(
                `
            *,
            instructor:users!instructor_id(first_name, last_name),
            gym:gyms!gym_id(name, address),
            assets:assets!class_id(id, content, type, valid_until, created_at, title)
            `,
            )
            .filter("id", "eq", classId);

        if (error) {
            throw error;
        }
        if (data.length === 0) {
            return null;
        }
        const instructor = (
            (data[0]?.instructor?.first_name ?? "") +
            " " +
            (data[0]?.instructor?.last_name ?? "")
        ).trim();
        return {
            ...data[0],
            instructor_name: instructor,
        }
    }

    async edit(data: Database["public"]["Tables"]["class"]["Update"]) {
        if (!data.id) {
            throw new Error("O ID da aula é obrigatório");
        }
        const { error } = await this.supabase
            .from("class")
            .update(data)
            .eq("id", data.id);
        if (error) {
            throw error;
        }
        return data;
    }

    async delete(classId: number) {
        const { error } = await this.supabase
            .from("class")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", classId);
        if (error) {
            throw error;
        }
    }
    async getToCheckIn(
        gymId: number,
        time: string,
        day: string,
    ) {
        const { data, error } = await this.supabase
            .from("class")
            .select("*")
            .eq("gym_id", gymId)
            .eq("day", day)
            .lte("start", time)
            .gte("end", time);

        if (error) {
            return null;
        }

        return data[0];
    }
}