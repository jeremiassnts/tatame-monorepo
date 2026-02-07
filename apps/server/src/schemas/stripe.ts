import z from "zod";

export const listProductsSchema = z.object({
    active: z
        .string()
        .optional()
        .transform((val) => val === undefined ? undefined : val === "true"),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (val > 0 && val <= 100), {
            message: "Limit must be between 1 and 100",
        }),
});

export const listPricesSchema = z.object({
    product: z.string().optional(),
    active: z
        .string()
        .optional()
        .transform((val) => val === undefined ? undefined : val === "true"),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (val > 0 && val <= 100), {
            message: "Limit must be between 1 and 100",
        }),
});

export const createCustomerSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    userId: z.number(),
});

export const createSubscriptionSchema = z.object({
    userId: z.number(),
    customerId: z.string(),
    priceId: z.string(),
});

export const createPaymentIntentSchema = z.object({
    amount: z.number(),
    currency: z.string(),
    customerId: z.string(),
});

export const createSetupIntentSchema = z.object({
    customerId: z.string(),
});

export const createEphemeralKeySchema = z.object({
    customerId: z.string(),
});