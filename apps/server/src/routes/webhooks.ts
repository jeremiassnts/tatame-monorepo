import { env } from "@tatame-monorepo/env/server";
import { Router } from "express";
import type { Request, Response } from "express";
import type Stripe from "stripe";
import { AppError } from "../middleware/errorHandler";
import { stripeService } from "../services/stripe";
import { supabaseService } from "../services/supabase";
import { webhookService } from "../services/webhooks";

export const webhooksRouter = Router();

/**
 * Stripe webhook endpoint
 * This endpoint must receive raw body for signature verification
 * Authentication is done via Stripe signature verification (not Clerk JWT)
 */
webhooksRouter.post(
  "/stripe",
  async (req: Request, res: Response, next) => {
    try {
      const signature = req.headers["stripe-signature"];

      if (!signature) {
        throw new AppError(
          400,
          "MISSING_SIGNATURE",
          "Missing Stripe signature header",
        );
      }

      // Get raw body for signature verification
      const rawBody = (req as any).rawBody;

      if (!rawBody) {
        throw new AppError(
          400,
          "MISSING_BODY",
          "Request body is required for webhook verification",
        );
      }

      let event: Stripe.Event;

      try {
        // Verify webhook signature
        const stripe = stripeService.getStripeInstance();
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature as string,
          env.STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        throw new AppError(
          400,
          "INVALID_SIGNATURE",
          "Invalid webhook signature",
        );
      }

      // Check if event has already been processed (idempotency)
      const isProcessed = await supabaseService.isWebhookEventProcessed(
        event.id,
      );

      if (isProcessed) {
        console.log(`Event ${event.id} already processed, skipping`);
        return res.status(200).json({ received: true, duplicate: true });
      }

      // Process the event
      await webhookService.processEvent(event);

      // Mark event as processed
      await supabaseService.markWebhookEventProcessed(event.id, event.type);

      // Return 200 to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  },
);
