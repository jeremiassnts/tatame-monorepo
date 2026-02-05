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