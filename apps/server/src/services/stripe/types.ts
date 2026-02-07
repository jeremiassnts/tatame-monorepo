export interface ListProductsParams {
    active?: boolean;
    limit?: number;
}

export interface ListPricesParams {
    product?: string;
    active?: boolean;
    limit?: number;
}

export interface CreateCustomerParams {
    email?: string;
    name?: string;
    metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
    customerId: string;
    priceId: string;
}

export interface CreatePaymentIntentParams {
    amount: number;
    currency: string;
    customerId: string;
}