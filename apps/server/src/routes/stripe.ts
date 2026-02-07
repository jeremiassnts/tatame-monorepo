import { createCustomerSchema, createEphemeralKeySchema, createPaymentIntentSchema, createSetupIntentSchema, createSubscriptionSchema, listProductsSchema } from "@/schemas/stripe";
import { Router } from "express";
import { stripeService } from "../services/stripe";

export const stripeRouter: Router = Router();

stripeRouter.get("/products", async (req, res, next) => {
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

stripeRouter.post("/customers", async (req, res, next) => {
  try {
    // Validate request body
    const validatedBody = createCustomerSchema.parse(req.body);
    // Create new Stripe customer
    const customer = await stripeService.createCustomer({
      email: validatedBody.email,
      name: validatedBody.name,
      metadata: {
        ...validatedBody.metadata,
        clerk_user_id: req.auth?.userId ?? "",
      },
    });
    res.status(201).json({
      data: customer,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.post("/subscriptions", async (req, res, next) => {
  try {
    // Validate request body
    const validatedBody = createSubscriptionSchema.parse(req.body);
    // Create new Stripe customer
    const subscription = await stripeService.createSubscription({
      customerId: validatedBody.customerId,
      priceId: validatedBody.priceId,
    });
    res.status(201).json({
      data: subscription,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.post("/payment-intents", async (req, res, next) => {
  try {
    // Validate request body
    const validatedBody = createPaymentIntentSchema.parse(req.body);
    // Create new Stripe payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: validatedBody.amount,
      currency: validatedBody.currency,
      customerId: validatedBody.customerId,
    });
    res.status(201).json({
      data: paymentIntent,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.post("/setup-intents", async (req, res, next) => {
  try {
    // Validate request body
    const validatedBody = createSetupIntentSchema.parse(req.body);
    // Create new Stripe setup intent
    const setupIntent = await stripeService.createSetupIntent(validatedBody.customerId);
    res.status(201).json({
      data: setupIntent,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.post("/ephemeral-keys", async (req, res, next) => {
  try {
    // Validate request body
    const validatedBody = createEphemeralKeySchema.parse(req.body);
    // Create new Stripe ephemeral key
    const ephemeralKey = await stripeService.createEphemeralKey(validatedBody.customerId);
    res.status(201).json({
      data: ephemeralKey,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});
