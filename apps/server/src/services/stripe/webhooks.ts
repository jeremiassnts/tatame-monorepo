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
        const subject = "Sua assinatura foi concluída com sucesso!";
        const title = "Bem vindo ao Tatame";
        let content = `Parabéns ${customer.name ?? ""}, sua assinatura do plano ${product.name ?? ""} foi concluída com sucesso!`;
        if (new Date(trialEnd * 1000) > new Date()) {
            content += ` Agora você pode utilizar todos os recursos disponíveis de forma gratuita até ${format(new Date(trialEnd * 1000), "dd/MM/yyyy")}, aproveite.`;
        }
        await resendService.sendEmail(customer.email!, subject, title, content)
    },
    handleSubscriptionTrialWillEnd: async (data: any) => {
        const customerId = data.object.customer;
        const trialEnd = data.object.trial_end;
        const [item] = data.object.items.data;
        const productId = item.price.product

        const customer = await stripeService.getCustomer(customerId);
        const product = await stripeService.getProduct(productId);

        const resendService = new ResendService();
        const subject = "Seu período de teste vai expirar!";
        const title = "Atenção: Seu período de teste vai expirar!";
        const content = `Olá ${customer.name ?? ""}, espero que tenha aproveitado sua assinatura, em breve seu período de testes do plano ${product.name ?? ""} chegará ao fim, ele é válido até o dia ${format(new Date(trialEnd * 1000), "dd/MM/yyyy")}. Não precisa se preocupar, sua assinatura será cobrada automaticamente. `;
        await resendService.sendEmail(customer.email!, subject, title, content)
    },
    handleSubscriptionDeleted: async (data: any) => {
        const customerId = data.object.customer;
        const [item] = data.object.items.data;
        const productId = item.price.product

        const customer = await stripeService.getCustomer(customerId);
        const product = await stripeService.getProduct(productId);

        const resendService = new ResendService();
        const subject = "Sua assinatura foi cancelada!";
        const title = "Sua assinatura foi cancelada!";
        const content = `Olá ${customer.name ?? ""}, sua assinatura do plano ${product.name ?? ""} foi cancelada com sucesso!`;
        await resendService.sendEmail(customer.email!, subject, title, content)
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
        const subject = "Sua assinatura foi renovada!";
        const title = "Assinatura renovada com sucesso!";
        const content = `Olá ${customer.name ?? ""}, sua assinatura do plano Tatame ${subscription.items.data[0]?.price.product.toString() ?? ""} no valor de ${currency.toUpperCase()} $${(amount / 100).toFixed(2).toString()}  foi renovada com sucesso!`;
        await resendService.sendEmail(customer.email!, subject, title, content)
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
        const subject = "Erro no pagamento da sua assinatura!";
        const title = "Erro no pagamento da sua assinatura!";
        const content = `Olá ${customer.name ?? ""}, ocorreu um problema ao processar a sua assinatura do plano Tatame ${subscription.items.data[0]?.price.product.toString() ?? ""} no valor de ${currency.toUpperCase()} $${(amount / 100).toFixed(2).toString()}. Verifique sua forma de pagamento e tente novamente.`;
        await resendService.sendEmail(customer.email!, subject, title, content)
    }
}