import z from "zod";

export const createAssetSchema = z.object({
    class_id: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional(),
});
