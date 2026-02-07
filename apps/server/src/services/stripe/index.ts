import { env } from "@tatame-monorepo/env/server";
import Stripe from "stripe";
import type { CreateCustomerParams, CreatePaymentIntentParams, CreateSubscriptionParams, ListProductsParams } from "./types";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const stripeService = {
  /**
   * Get the Stripe instance (for webhook verification)
   */
  getStripeInstance() {
    return stripe;
  },

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
   * Get a Stripe product by ID
   */
  async getProduct(productId: string) {
    return await stripe.products.retrieve(productId);
  },
  /**
   * Create a new Stripe customer
   */
  async createCustomer(params: CreateCustomerParams) {
    const customer = await stripe.customers.list({
      email: params.email,
    })
    if (customer.data.length > 0) {
      return customer.data[0];
    }
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
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found");
    }
    return customer;
  },
  /**
   * Create a new Stripe subscription
   */
  async createSubscription(params: CreateSubscriptionParams) {
    return await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 30
    });
  },
  /**
   * Get a Stripe subscription by customerId
   */
  async getSubscriptionByCustomerId(customerId: string) {
    const { data } = await stripe.subscriptions.list({
      customer: customerId,
    });
    return data[0]
  },
  /**
   * Get a Stripe subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  },
  /** 
   * Create a new Stripe payment intent
   */
  async createPaymentIntent(params: CreatePaymentIntentParams) {
    return await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      customer: params.customerId,
    });
  },
  /**
   * Create a new Stripe SetupIntent
   */
  async createSetupIntent(customerId: string) {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  },

  /**
   * Create a new Stripe EphemeralKey
   */
  async createEphemeralKey(customerId: string) {
    return await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2025-02-24.acacia' }
    );
  },
};
