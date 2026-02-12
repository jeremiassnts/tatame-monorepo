import type { SupabaseClient } from "@supabase/supabase-js";
import { RolesService } from "../roles";
import { SupabaseService } from "../supabase";
import type { Database } from "../supabase/types";
import { UsersService } from "../users";
import type { SendNotificationProps } from "./types";

export class NotificationsService {
    private supabase: SupabaseClient;
    private rolesService: RolesService;
    private usersService: UsersService;
    constructor(accessToken: string) {
        this.supabase = (new SupabaseService(accessToken)).getClient();
        this.rolesService = new RolesService(accessToken);
        this.usersService = new UsersService(accessToken);
    }

    async create(notification: Database["public"]["Tables"]["notifications"]["Insert"]) {
        const { data, error } = await this.supabase.from("notifications").insert(notification)
            .select()

        if (error) {
            throw error;
        }
        try {
            await this.sendNotification({
                id: data[0].id,
                channel: "push",
                title: data[0].title ?? "",
                content: data[0].content ?? "",
                recipients: data[0].recipients ?? [],
            })
            await this.supabase.from("notifications").update({
                id: data[0].id,
                status: "sent",
                sent_at: new Date().toISOString(),
            }).eq("id", data[0].id)
        } catch (error) {
            this.supabase.from("notifications").update({
                id: data[0].id,
                status: "failed",
            }).eq("id", data[0].id)
        }
        return data[0];
    }

    async listByUserId(userId: number) {
        const { data, error } = await this.supabase
            .from("notifications")
            .select("*, users(first_name, last_name, profile_picture)")
            .or(
                `recipients.cs.{${userId.toString()}},sent_by.eq.${userId.toString()}`,
            )
            .order("created_at", { ascending: false });
        if (error) {
            throw error;
        } else if (!data) {
            return [];
        }

        return data.map((notification) => {
            const sent_by_name = (
                (notification.users?.first_name ?? "") +
                " " +
                (notification.users?.last_name ?? "")
            ).trim();
            return {
                ...notification,
                sent_by_name: sent_by_name,
                sent_by_image_url: notification.users?.profile_picture ?? "",
            }
        });
    }

    async listUnreadByUserId(userId: number) {
        const currentUser = await this.usersService.get(userId);
        if (!this.rolesService.isHigherRole(currentUser.role) && !currentUser?.approved_at) {
            return [];
        }

        const { data } = await this.supabase
            .from("notifications")
            .select("*")
            .contains("recipients", [userId])
            .or(`sent_by.neq.${userId},sent_by.is.null`)
            .order("created_at", { ascending: false });
        const filteredData = data?.filter((e) => !e.viewed_by?.includes(userId));
        return filteredData;
    }

    async update(notification: Database["public"]["Tables"]["notifications"]["Update"]) {
        const { data, error } = await this.supabase
            .from("notifications")
            .update(notification)
            .eq("id", notification.id);
        if (error) {
            throw error;
        }
        return data;
    }

    async resend(notificationId: number) {
        const { data, error } = await this.supabase
            .from("notifications")
            .select("*")
            .eq("id", notificationId);
        if (error) {
            throw error;
        }
        this.sendNotification({
            id: data[0].id,
            channel: "push",
            title: data[0].title ?? "",
            content: data[0].content ?? "",
            recipients: data[0].recipients ?? [],
        }).then(() => {
            this.update({
                id: data[0].id,
                status: "sent",
                sent_at: new Date().toISOString(),
            })
        })
            .catch((error) => {
                console.error(error);
                this.update({
                    id: data[0].id,
                    status: "failed",
                })
            });
    }

    async view(id: number, userId: number) {
        const { data } = await this.supabase
            .from("notifications")
            .select("*")
            .eq("id", id);
        const notification = data?.[0];
        const { error } = await this.supabase
            .from("notifications")
            .update({ viewed_by: [...notification.viewed_by, userId] })
            .eq("id", id);

        if (error) {
            throw error;
        }
    }

    async sendNotification(notification: SendNotificationProps) {
        try {
            switch (notification.channel) {
                case "push":
                    return await this.sendPushNotification(notification);
                default:
                    throw new Error("Canal de notificação não suportado");
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async sendPushNotification(notification: SendNotificationProps) {
        const { data, error } = await this.supabase
            .from("users")
            .select("expo_push_token")
            .in(
                "id",
                notification.recipients.map((recipient) => Number(recipient)),
            );
        if (error) {
            throw error;
        }
        const expoPushTokens = data.map((user) => user.expo_push_token);
        const messages = expoPushTokens
            .filter((token) => !!token)
            .map((token) => ({
                to: token,
                sound: "default",
                title: notification.title,
                body: notification.content,
                data: {
                    notification_id: notification.id,
                },
            }));
        return messages;
    }
}