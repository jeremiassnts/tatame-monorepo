import z from "zod";

export const createCheckinSchema = z.object({
    userId: z.number(),
    classId: z.number(),
    date: z.string().optional(),
});

export const listLastCheckinsSchema = z.object({
    userId: z.string().transform((val) => Number.parseInt(val, 10)),
});

export const listLastMonthCheckinsSchema = z.object({
    userId: z.string().transform((val) => Number.parseInt(val, 10)),
});

export const listByClassIdSchema = z.object({
    classId: z.string().transform((val) => Number.parseInt(val, 10)),
});

export const listByClassIdAndUserIdSchema = z.object({
    classId: z.string().transform((val) => Number.parseInt(val, 10)),
    userId: z.string().transform((val) => Number.parseInt(val, 10)),
});
