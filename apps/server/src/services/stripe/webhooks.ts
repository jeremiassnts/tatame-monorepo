import { format } from "date-fns";
import { stripeService } from ".";
import { ResendService } from "../resend";

export const stripeWebhooksService = {
    handleSubscriptionCreated: async (data: any) => {
        const customerId = data.object.customer;
        const trialEnd = data.object.trial_end;
        const [item] = data.object.items.data;
        const productId = item.price.product

        const customer = await stripeService.getCustomer(customerId);
        const product = await stripeService.getProduct(productId);

        const resendService = new ResendService();
        await resendService.sendEmailWithTemplate("manager-welcome", customer.email!, {
            "CLIENT": customer.name ?? "",
            "PLAN": product.name ?? "",
            "TRIALEND": format(new Date(trialEnd * 1000), "dd/MM/yyyy")
        })
    },
    handleSubscriptionTrialWillEnd: async (data: any) => {
        const customerId = data.object.customer;
        const trialEnd = data.object.trial_end;
        const [item] = data.object.items.data;
        const productId = item.price.product

        const customer = await stripeService.getCustomer(customerId);
        const product = await stripeService.getProduct(productId);

        const resendService = new ResendService();
        await resendService.sendEmailWithTemplate("trial-end-warning", customer.email!, {
            "CLIENT": customer.name ?? "",
            "PLAN": product.name ?? "",
            "TRIALEND": format(new Date(trialEnd * 1000), "dd/MM/yyyy")
        })
    },
    handleInvoicePaid: async (data: any) => {
        const customerId = data.object.customer;
        const amount = data.object.amount_paid;
        if (amount <= 0) {
            return;
        }
        const subscriptionId = data.object.parent.subscription_details.subscription;
        const currency = data.object.currency;

        const customer = await stripeService.getCustomer(customerId);
        const subscription = await stripeService.getSubscription(subscriptionId);

        const resendService = new ResendService();
        await resendService.sendEmailWithTemplate("invoice-paid", customer.email!, {
            "CLIENT": customer.name ?? "",
            "PLAN": subscription.items.data[0]?.price.product.toString() ?? "",
            "PRICE": `${currency.toUpperCase()} $${(amount / 100).toFixed(2).toString()}`
        })
    },
    handleInvoicePaymentFailed: async (data: any) => {
        const customerId = data.object.customer;
        const amount = data.object.amount_paid;
        if (amount <= 0) {
            return;
        }
        const subscriptionId = data.object.parent.subscription_details.subscription;
        const currency = data.object.currency;

        const customer = await stripeService.getCustomer(customerId);
        const subscription = await stripeService.getSubscription(subscriptionId);

        const resendService = new ResendService();
        await resendService.sendEmailWithTemplate("invoice-payment-failed", customer.email!, {
            "CLIENT": customer.name ?? "",
            "PLAN": subscription.items.data[0]?.price.product.toString() ?? "",
            "PRICE": `${currency.toUpperCase()} $${(amount / 100).toFixed(2).toString()}`
        })
    }
}