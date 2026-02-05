export interface StripeCustomerMapping {
    id?: string;
    user_id: string;
    clerk_user_id: string;
    stripe_customer_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface StripeWebhookEvent {
    id?: string;
    stripe_event_id: string;
    event_type: string;
    processed_at?: string;
    created_at?: string;
}