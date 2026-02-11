import { createCustomerSchema, createEphemeralKeySchema, createPaymentIntentSchema, createSetupIntentSchema, createSubscriptionSchema, listProductsSchema } from "@/schemas/stripe";
import { SupabaseService } from "@/services/supabase";
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
        user_id: validatedBody.userId?.toString(),
      },
    });
    // Update user with customer_id
    const supabaseService = new SupabaseService(await req.auth?.getToken() ?? "");
    await supabaseService.updateUser({
      id: validatedBody.userId,
      customer_id: customer?.id,
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
    // Update user with subscription_id
    const supabaseService = new SupabaseService(await req.auth?.getToken() ?? "");
    await supabaseService.updateUser({
      id: validatedBody.userId,
      subscription_id: subscription?.id,
    });
    res.status(201).json({
      data: subscription,
      created: true,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.get("/subscriptions/:subscriptionId", async (req, res, next) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    // Find subscription by subscriptionId
    const subscription = await stripeService.getSubscription(subscriptionId);
    res.status(200).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.get("/subscriptions/customer/:customerId", async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    // Find subscription by customerId
    const subscription = await stripeService.getSubscriptionByCustomerId(customerId);
    res.status(200).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
});

stripeRouter.delete("/subscriptions/:subscriptionId", async (req, res, next) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    // Cancel subscription by subscriptionId
    const subscription = await stripeService.cancelSubscription(subscriptionId);
    res.status(200).json({
      data: subscription,
      deleted: true,
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
