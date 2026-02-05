import type Stripe from "stripe";
import { supabaseService } from "../supabase";

/**
 * Webhook event handlers
 * Add handlers for specific Stripe events here
 */

export const webhookService = {
  /**
   * Process a Stripe webhook event
   * Dispatches to specific handlers based on event type
   */
  async processEvent(event: Stripe.Event): Promise<void> {
    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        // Customer events
        case "customer.created":
          await this.handleCustomerCreated(event);
          break;
        case "customer.updated":
          await this.handleCustomerUpdated(event);
          break;
        case "customer.deleted":
          await this.handleCustomerDeleted(event);
          break;

        // Subscription events
        case "customer.subscription.created":
          await this.handleSubscriptionCreated(event);
          break;
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event);
          break;
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event);
          break;

        // Payment events
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event);
          break;
        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event);
          break;

        // Checkout session events
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event);
          break;
        case "checkout.session.expired":
          await this.handleCheckoutSessionExpired(event);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
      throw error;
    }
  },

  /**
   * Handle customer.created event
   */
  async handleCustomerCreated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    console.log(`Customer created: ${customer.id}`);
    // Additional logic can be added here
  },

  /**
   * Handle customer.updated event
   */
  async handleCustomerUpdated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    console.log(`Customer updated: ${customer.id}`);
    // Additional logic can be added here
  },

  /**
   * Handle customer.deleted event
   */
  async handleCustomerDeleted(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;
    console.log(`Customer deleted: ${customer.id}`);
    // Additional logic: potentially mark customer as deleted in Supabase
  },

  /**
   * Handle customer.subscription.created event
   */
  async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(`Subscription created: ${subscription.id} for customer ${subscription.customer}`);
    // Store subscription details in Supabase
  },

  /**
   * Handle customer.subscription.updated event
   */
  async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(
      `Subscription updated: ${subscription.id} - status: ${subscription.status}`,
    );
    // Update subscription status in Supabase
  },

  /**
   * Handle customer.subscription.deleted event
   */
  async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(`Subscription deleted: ${subscription.id}`);
    // Mark subscription as cancelled in Supabase
  },

  /**
   * Handle invoice.payment_succeeded event
   */
  async handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    console.log(
      `Invoice payment succeeded: ${invoice.id} for customer ${invoice.customer}`,
    );
    // Record successful payment in Supabase
  },

  /**
   * Handle invoice.payment_failed event
   */
  async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    console.log(
      `Invoice payment failed: ${invoice.id} for customer ${invoice.customer}`,
    );
    // Handle failed payment (e.g., send notification)
  },

  /**
   * Handle checkout.session.completed event
   */
  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Checkout session completed: ${session.id}`);
    // Process successful checkout (e.g., activate subscription)
  },

  /**
   * Handle checkout.session.expired event
   */
  async handleCheckoutSessionExpired(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`Checkout session expired: ${session.id}`);
    // Handle expired session if needed
  },
};
