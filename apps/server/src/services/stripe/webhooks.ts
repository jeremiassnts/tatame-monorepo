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
    }
}