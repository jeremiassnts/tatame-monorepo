import z from "zod";

export const createClassSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
    gym_id: z.number(),
    instructor_id: z.number(),
    created_by: z.number().optional(),
});

export const updateClassSchema = z.object({
    id: z.number(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).optional(),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format").optional(),
    end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional(),
    instructor_id: z.number().optional(),
});

export const getToCheckInSchema = z.object({
    gymId: z.string().transform((val) => Number.parseInt(val, 10)),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
});
