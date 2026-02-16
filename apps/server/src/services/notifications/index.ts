import { db } from "@tatame-monorepo/db";
import { notifications, users } from "@tatame-monorepo/db/schema";
import { eq, inArray, or, sql, desc } from "drizzle-orm";
import { RolesService } from "../roles";
import { UsersService } from "../users";
import type { SendNotificationProps } from "./types";

/** Insert shape from API (snake_case) */
export type NotificationInsert = {
    title?: string | null;
    content?: string | null;
    recipients?: string[] | null;
    channel?: string | null;
    sent_by?: number | null;
    status?: string | null;
    viewed_by?: string[] | null;
};

/** Update shape from API */
export type NotificationUpdate = {
    id: number;
    title?: string | null;
    content?: string | null;
    status?: string | null;
    viewed_by?: string[] | null;
};

export class NotificationsService {
    private rolesService: RolesService;
    private usersService: UsersService;

    constructor(accessToken: string) {
        this.rolesService = new RolesService(accessToken);
        this.usersService = new UsersService(accessToken);
    }

    async create(notification: NotificationInsert) {
        const [row] = await db
            .insert(notifications)
            .values({
                title: notification.title ?? null,
                content: notification.content ?? null,
                recipients: notification.recipients ?? [],
                channel: notification.channel ?? "push",
                sentBy: notification.sent_by ?? null,
                status: notification.status ?? "pending",
                viewedBy: notification.viewed_by ?? [],
            })
            .returning();

        if (!row) throw new Error("Failed to create notification");

        try {
            await this.sendNotification({
                id: row.id,
                channel: "push",
                title: row.title ?? "",
                content: row.content ?? "",
                recipients: row.recipients ?? [],
            });
            await db
                .update(notifications)
                .set({ status: "sent", sentAt: new Date() })
                .where(eq(notifications.id, row.id));
        } catch (error) {
            await db
                .update(notifications)
                .set({ status: "failed" })
                .where(eq(notifications.id, row.id));
        }
        return row;
    }

    async listByUserId(userId: number) {
        const userIdStr = userId.toString();
        const rows = await db
            .select({
                notification: notifications,
                senderFirstName: users.firstName,
                senderLastName: users.lastName,
                senderProfilePicture: users.profilePicture,
            })
            .from(notifications)
            .leftJoin(users, eq(notifications.sentBy, users.id))
            .where(
                or(
                    eq(notifications.sentBy, userId),
                    sql`array_position(COALESCE(${notifications.recipients}, ARRAY[]::text[]), ${userIdStr}) IS NOT NULL`,
                ),
            )
            .orderBy(desc(notifications.createdAt));

        return rows.map((row) => {
            const n = row.notification;
            const sentByName = [row.senderFirstName ?? "", row.senderLastName ?? ""].join(" ").trim();
            return {
                ...n,
                sent_by_name: sentByName,
                sent_by_image_url: row.senderProfilePicture ?? "",
            };
        });
    }

    async listUnreadByUserId(userId: number) {
        const currentUser = await this.usersService.get(userId);
        if (!currentUser || (!this.rolesService.isHigherRole(currentUser.role ?? "") && !currentUser.approvedAt)) {
            return [];
        }

        const userIdStr = userId.toString();
        const rows = await db
            .select()
            .from(notifications)
            .where(
                sql`array_position(COALESCE(${notifications.recipients}, ARRAY[]::text[]), ${userIdStr}) IS NOT NULL`,
            )
            .orderBy(desc(notifications.createdAt));

        return rows.filter((n) => {
            const viewedBy = n.viewedBy ?? [];
            const isSender = n.sentBy === userId;
            if (isSender) return false;
            return !viewedBy.includes(userIdStr);
        });
    }

    async update(notification: NotificationUpdate) {
        await db
            .update(notifications)
            .set({
                ...(notification.title !== undefined && { title: notification.title }),
                ...(notification.content !== undefined && { content: notification.content }),
                ...(notification.status !== undefined && { status: notification.status }),
                ...(notification.viewed_by !== undefined && { viewedBy: notification.viewed_by }),
            })
            .where(eq(notifications.id, notification.id));
    }

    async resend(notificationId: number) {
        const [row] = await db
            .select()
            .from(notifications)
            .where(eq(notifications.id, notificationId));

        if (!row) throw new Error("Notification not found");

        this.sendNotification({
            id: row.id,
            channel: "push",
            title: row.title ?? "",
            content: row.content ?? "",
            recipients: row.recipients ?? [],
        })
            .then(() =>
                db
                    .update(notifications)
                    .set({ status: "sent", sentAt: new Date() })
                    .where(eq(notifications.id, row.id)),
            )
            .catch((error) => {
                console.error(error);
                this.update({ id: row.id, status: "failed" });
            });
    }

    async view(id: number, userId: number) {
        const [notification] = await db
            .select()
            .from(notifications)
            .where(eq(notifications.id, id));

        if (!notification) return;

        const viewedBy = notification.viewedBy ?? [];
        if (viewedBy.includes(userId.toString())) return;

        await db
            .update(notifications)
            .set({ viewedBy: [...viewedBy, userId.toString()] })
            .where(eq(notifications.id, id));
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
        const recipientIds = notification.recipients.map((r) => Number(r)).filter((n) => !Number.isNaN(n));
        if (recipientIds.length === 0) return [];

        const userRows = await db
            .select({ expoPushToken: users.expoPushToken })
            .from(users)
            .where(inArray(users.id, recipientIds));

        const expoPushTokens = userRows.map((u) => u.expoPushToken).filter((t): t is string => !!t);
        return expoPushTokens.map((token) => ({
            to: token,
            sound: "default" as const,
            title: notification.title,
            body: notification.content,
            data: { notification_id: notification.id },
        }));
    }
}
