import { env } from "@tatame-monorepo/env/server";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export interface ListProductsParams {
  active?: boolean;
  limit?: number;
}

export interface ListPricesParams {
  product?: string;
  active?: boolean;
  limit?: number;
}

export interface CreateCustomerParams {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

export const stripeService = {
  /**
   * List Stripe products with optional filters
   */
  async listProducts(params: ListProductsParams = {}) {
    const { active = true, limit = 10 } = params;

    const products = await stripe.products.list({
      active,
      limit: Math.min(limit, 100),
      expand: ["data.default_price"],
    });

    return products.data;
  },

  /**
   * List Stripe prices with optional filters
   */
  async listPrices(params: ListPricesParams = {}) {
    const { product, active = true, limit = 10 } = params;

    const prices = await stripe.prices.list({
      product,
      active,
      limit: Math.min(limit, 100),
      expand: ["data.product"],
    });

    return prices.data;
  },

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string) {
    return await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });
  },

  /**
   * Get a single price by ID
   */
  async getPrice(priceId: string) {
    return await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });
  },

  /**
   * Create a new Stripe customer
   */
  async createCustomer(params: CreateCustomerParams) {
    return await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata || {},
    });
  },

  /**
   * Get a Stripe customer by ID
   */
  async getCustomer(customerId: string) {
    return await stripe.customers.retrieve(customerId);
  },
};
