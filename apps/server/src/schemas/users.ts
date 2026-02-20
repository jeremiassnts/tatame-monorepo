import z from "zod";

export const createUserSchema = z.object({
    clerkUserId: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR", "MANAGER"]),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    profilePicture: z.string().optional(),
});

export const updateUserSchema = z.object({
    id: z.number(),
    clerkUserId: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    firstName: z.string().min(1).nullable().optional(),
    lastName: z.string().min(1).nullable().optional(),
    profilePicture: z.string().nullable().optional(),
    birth: z.string().nullable().optional(),
    birthDay: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
    gymId: z.number().nullable().optional(),
    expoPushToken: z.string().nullable().optional(),
    customerId: z.string().nullable().optional(),
    subscriptionId: z.string().nullable().optional(),
    plan: z.string().nullable().optional(),
    approvedAt: z.date().nullable().optional(),
    deniedAt: z.date().nullable().optional(),
    migratedAt: z.date().nullable().optional(),
});

export const approveStudentSchema = z.object({
    userId: z.number(),
});

export const denyStudentSchema = z.object({
    userId: z.number(),
});

export const updateExpoPushTokenSchema = z.object({
    expoPushToken: z.string(),
});