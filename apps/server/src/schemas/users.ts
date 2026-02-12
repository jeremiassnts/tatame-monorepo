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
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    birth_day: z.string().optional(),
    profile_picture: z.string().optional(),
    gym_id: z.number().optional(),
    role: z.enum(["STUDENT", "INSTRUCTOR", "MANAGER"]).optional(),
});

export const approveStudentSchema = z.object({
    userId: z.number(),
});

export const denyStudentSchema = z.object({
    userId: z.number(),
});
