import z from "zod";

export const createGraduationSchema = z.object({
    userId: z.number(),
    belt: z.string().min(1),
    degree: z.number().optional(),
    modality: z.string().optional(),
});

export const updateGraduationSchema = z.object({
    id: z.number(),
    belt: z.string().optional(),
    degree: z.number().optional(),
    graduationDate: z.string().optional(),
});
