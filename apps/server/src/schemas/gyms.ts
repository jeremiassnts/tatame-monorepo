import z from "zod";

export const createGymSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    description: z.string().optional(),
    since: z.string().optional(),
    logo: z.string().optional(),
});

export const associateGymSchema = z.object({
    gymId: z.number(),
    userId: z.number(),
});

export const updateGymSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    description: z.string().optional(),
    since: z.string().optional(),
    logo: z.string().optional(),
});