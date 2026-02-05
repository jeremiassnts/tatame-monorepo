import { Router } from "express";
import { z } from "zod";
import { protectRoute } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { stripeService } from "../services/stripe";
import { supabaseService } from "../services/supabase";

export const stripeRouter = Router();

const listProductsSchema = z.object({
  active: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val > 0 && val <= 100), {
      message: "Limit must be between 1 and 100",
    }),
});

const listPricesSchema = z.object({
  product: z.string().optional(),
  active: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val > 0 && val <= 100), {
      message: "Limit must be between 1 and 100",
    }),
});

stripeRouter.get("/products", protectRoute, async (req, res, next) => {
  try {
    const validatedQuery = listProductsSchema.parse(req.query);

    const products = await stripeService.listProducts({
      active: validatedQuery.active,
      limit: validatedQuery.limit,
    });

    res.json({
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.get("/prices", protectRoute, async (req, res, next) => {
  try {
    const validatedQuery = listPricesSchema.parse(req.query);

    const prices = await stripeService.listPrices({
      product: validatedQuery.product,
      active: validatedQuery.active,
      limit: validatedQuery.limit,
    });

    res.json({
      data: prices,
      count: prices.length,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.get("/products/:id", protectRoute, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "INVALID_PRODUCT_ID", "Product ID is required");
    }

    const product = await stripeService.getProduct(id);

    res.json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.get("/prices/:id", protectRoute, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "INVALID_PRICE_ID", "Price ID is required");
    }

    const price = await stripeService.getPrice(id);

    res.json({
      data: price,
    });
  } catch (error) {
    next(error);
  }
});

const createCustomerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

stripeRouter.post("/customer", protectRoute, async (req, res, next) => {
  try {
    const auth = req.auth;

    if (!auth?.userId) {
      throw new AppError(401, "UNAUTHORIZED", "User not authenticated");
    }

    const clerkUserId = auth.userId;

    // Check if customer already exists
    const existingCustomerId =
      await supabaseService.getStripeCustomerByClerkId(clerkUserId);

    if (existingCustomerId) {
      // Return existing customer
      const customer = await stripeService.getCustomer(existingCustomerId);
      return res.json({
        data: customer,
        created: false,
      });
    }

    // Validate request body
    const validatedBody = createCustomerSchema.parse(req.body);

    // Create new Stripe customer
    const customer = await stripeService.createCustomer({
      email: validatedBody.email,
      name: validatedBody.name,
      metadata: {
        ...validatedBody.metadata,
        clerk_user_id: clerkUserId,
      },
    });

    // Store mapping in Supabase
    await supabaseService.upsertStripeCustomerMapping({
      user_id: clerkUserId,
      clerk_user_id: clerkUserId,
      stripe_customer_id: customer.id,
    });

    res.status(201).json({
      data: customer,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});
