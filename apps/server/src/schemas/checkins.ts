import z from "zod";

export const createCheckinSchema = z.object({
    userId: z.number(),
    classId: z.number(),
    date: z.coerce.date()
});

export const listLastCheckinsSchema = z.object({
    userId: z.string().transform((val) => Number.parseInt(val, 10)),
});

export const listLastMonthCheckinsSchema = z.object({
    userId: z.string().transform((val) => Number.parseInt(val, 10)),
});

export const listByClassIdParamsSchema = z.object({
    classId: z.coerce.number(),
});

export const listByClassIdQuerySchema = z.object({
    date: z.coerce.date(),
});

export const listByClassIdAndUserIdSchema = z.object({
    classId: z.string().transform((val) => Number.parseInt(val, 10)),
    userId: z.string().transform((val) => Number.parseInt(val, 10)),
});
