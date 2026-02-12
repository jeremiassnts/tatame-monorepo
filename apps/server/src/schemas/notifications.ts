import z from "zod";

export const createNotificationSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    recipients: z.array(z.string()),
    channel: z.enum(["push", "email", "sms"]),
    sent_by: z.number().optional(),
    status: z.enum(["pending", "sent", "failed"]).optional(),
    viewed_by: z.array(z.string()).optional(),
});

export const updateNotificationSchema = z.object({
    id: z.number(),
    title: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(["pending", "sent", "failed"]).optional(),
    viewed_by: z.array(z.string()).optional(),
});

export const viewNotificationSchema = z.object({
    id: z.number(),
    userId: z.number(),
});
