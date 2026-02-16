import { createNotificationSchema, updateNotificationSchema, viewNotificationSchema } from "@/schemas/notifications";
import { NotificationsService } from "@/services/notifications";
import { Router } from "express";

export const notificationsRouter: Router = Router();

// Create a notification
notificationsRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createNotificationSchema.parse(req.body);
        const notificationsService = new NotificationsService();
        const notification = await notificationsService.create({
            title: validatedBody.title,
            content: validatedBody.content,
            recipients: validatedBody.recipients,
            channel: validatedBody.channel,
            sent_by: validatedBody.sent_by,
            status: validatedBody.status ?? "pending",
            viewed_by: validatedBody.viewed_by ?? [],
        });

        res.status(201).json({
            data: notification,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// List notifications by user id
notificationsRouter.get("/user/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const notificationsService = new NotificationsService();
        const notifications = await notificationsService.listByUserId(userId);

        res.json({
            data: notifications,
            count: notifications.length,
        });
    } catch (error) {
        next(error);
    }
});

// List unread notifications by user id
notificationsRouter.get("/user/:userId/unread", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const notificationsService = new NotificationsService();
        const notifications = await notificationsService.listUnreadByUserId(userId);

        res.json({
            data: notifications,
            count: notifications?.length ?? 0,
        });
    } catch (error) {
        next(error);
    }
});

// Update a notification
notificationsRouter.put("/:notificationId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notificationId = Number.parseInt(req.params.notificationId, 10);
        if (Number.isNaN(notificationId)) {
            return res.status(400).json({ error: "Invalid notificationId" });
        }

        const validatedBody = updateNotificationSchema.parse({ ...req.body, id: notificationId });
        const notificationsService = new NotificationsService();
        await notificationsService.update(validatedBody);

        res.json({
            success: true,
            message: "Notification updated successfully",
        });
    } catch (error) {
        next(error);
    }
});

// Resend a notification
notificationsRouter.post("/:notificationId/resend", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notificationId = Number.parseInt(req.params.notificationId, 10);
        if (Number.isNaN(notificationId)) {
            return res.status(400).json({ error: "Invalid notificationId" });
        }

        const notificationsService = new NotificationsService();
        await notificationsService.resend(notificationId);

        res.json({
            success: true,
            message: "Notification resent successfully",
        });
    } catch (error) {
        next(error);
    }
});

// Mark notification as viewed
notificationsRouter.post("/:notificationId/view", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notificationId = Number.parseInt(req.params.notificationId, 10);
        if (Number.isNaN(notificationId)) {
            return res.status(400).json({ error: "Invalid notificationId" });
        }

        const validatedBody = viewNotificationSchema.parse({
            id: notificationId,
            userId: req.body.userId,
        });

        const notificationsService = new NotificationsService();
        await notificationsService.view(validatedBody.id, validatedBody.userId);

        res.json({
            success: true,
            message: "Notification marked as viewed",
        });
    } catch (error) {
        next(error);
    }
});
