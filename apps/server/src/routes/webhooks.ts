import { stripeWebhooksService } from "@/services/stripe/webhooks";
import { Router } from "express";

export const webhooksRouter: Router = Router();

webhooksRouter.post("/stripe", async (req, res, next) => {
    try {
        const { data, type } = req.body;
        switch (type) {
            case "customer.subscription.created":
                await stripeWebhooksService.handleSubscriptionCreated(data);
                break;
            case "customer.subscription.trial_will_end":
                await stripeWebhooksService.handleSubscriptionTrialWillEnd(data);
                break;
            case "invoice.paid":
                await stripeWebhooksService.handleInvoicePaid(data);
                break;
            case "invoice.payment_failed":
                await stripeWebhooksService.handleInvoicePaymentFailed(data);
                break;
            default:
                break;
        }
        res.status(200).json({ message: "Webhook received" });
    } catch (error) {
        next(error);
    }
});