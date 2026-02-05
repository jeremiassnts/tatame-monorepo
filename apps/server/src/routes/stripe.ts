import { Router } from "express";
import { z } from "zod";
import { protectRoute } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { stripeService } from "../services/stripe";

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
