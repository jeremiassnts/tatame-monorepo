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
            default:
                break;
        }
        res.status(200).json({ message: "Webhook received" });
    } catch (error) {
        next(error);
    }
});