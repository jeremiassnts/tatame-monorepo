# API Reference - Quick Guide

**Version:** 1.0  
**Last updated:** 2026-02-05  
**Base URL:** `http://localhost:3000` (development) or `https://your-domain.com` (production)

---

## Authentication

All protected routes require a **Clerk JWT token** in the `Authorization` header:

```http
Authorization: Bearer <clerk-jwt-token>
```

**Obtaining a token:**
- Frontend: Use `@clerk/nextjs` - token is automatically handled
- Mobile: Use `@clerk/clerk-expo` - get token with `getToken()`
- Testing: Get token from Clerk Dashboard or use Clerk's test tokens

---

## Endpoints

### 1. Health Check

**GET** `/`

Public endpoint to verify server is running.

**Request:**
```http
GET / HTTP/1.1
Host: localhost:3000
```

**Response:**
```
Status: 200 OK
Body: OK
```

---

### 2. List Products

**GET** `/stripe/products`

List all Stripe products (requires authentication).

**Query Parameters:**
- `active` (boolean, optional): Filter by active status. Default: `true`
- `limit` (integer, optional): Max items to return (1-100). Default: `10`

**Request:**
```http
GET /stripe/products?active=true&limit=20 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <clerk-jwt-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "prod_...",
      "name": "Premium Plan",
      "description": "Full access to all features",
      "active": true,
      "default_price": {
        "id": "price_...",
        "unit_amount": 2999,
        "currency": "usd"
      }
    }
  ],
  "count": 1
}
```

---

### 3. List Prices

**GET** `/stripe/prices`

List all Stripe prices (requires authentication).

**Query Parameters:**
- `product` (string, optional): Filter by product ID
- `active` (boolean, optional): Filter by active status. Default: `true`
- `limit` (integer, optional): Max items to return (1-100). Default: `10`

**Request:**
```http
GET /stripe/prices?product=prod_...&active=true&limit=20 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <clerk-jwt-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "price_...",
      "product": "prod_...",
      "unit_amount": 2999,
      "currency": "usd",
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "active": true
    }
  ],
  "count": 1
}
```

---

### 4. Get Product by ID

**GET** `/stripe/products/:id`

Retrieve a single product by ID (requires authentication).

**Path Parameters:**
- `id` (string, required): Stripe product ID

**Request:**
```http
GET /stripe/products/prod_ABC123 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <clerk-jwt-token>
```

**Response:**
```json
{
  "data": {
    "id": "prod_ABC123",
    "name": "Premium Plan",
    "description": "Full access to all features",
    "active": true,
    "default_price": { ... }
  }
}
```

---

### 5. Get Price by ID

**GET** `/stripe/prices/:id`

Retrieve a single price by ID (requires authentication).

**Path Parameters:**
- `id` (string, required): Stripe price ID

**Request:**
```http
GET /stripe/prices/price_ABC123 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <clerk-jwt-token>
```

**Response:**
```json
{
  "data": {
    "id": "price_ABC123",
    "product": "prod_...",
    "unit_amount": 2999,
    "currency": "usd",
    "recurring": { ... }
  }
}
```

---

### 6. Create/Get Customer

**POST** `/stripe/customer`

Create or retrieve a Stripe customer for the authenticated user (requires authentication).

**Request Body (optional):**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": {
    "custom_field": "value"
  }
}
```

**Request:**
```http
POST /stripe/customer HTTP/1.1
Host: localhost:3000
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (New Customer):**
```json
{
  "data": {
    "id": "cus_...",
    "email": "user@example.com",
    "name": "John Doe",
    "metadata": {
      "clerk_user_id": "user_..."
    }
  },
  "created": true
}
```

**Response (Existing Customer):**
```json
{
  "data": {
    "id": "cus_...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "created": false
}
```

---

### 7. Stripe Webhook

**POST** `/webhooks/stripe`

Receive and process Stripe webhook events (no Clerk auth required - uses Stripe signature).

**Headers:**
- `Stripe-Signature` (required): Webhook signature from Stripe

**Request:**
```http
POST /webhooks/stripe HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Stripe-Signature: t=...,v1=...

{
  "id": "evt_...",
  "type": "customer.subscription.created",
  "data": { ... }
}
```

**Response:**
```json
{
  "received": true
}
```

**Response (Duplicate Event):**
```json
{
  "received": true,
  "duplicate": true
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_PARAMS` | Invalid query parameters or request body |
| 400 | `INVALID_SIGNATURE` | Webhook signature verification failed |
| 401 | `UNAUTHORIZED` | Missing or invalid Clerk JWT token |
| 404 | `NOT_FOUND` | Resource not found (product, price, customer) |
| 500 | `INTERNAL_ERROR` | Server error |
| 502 | `SERVICE_ERROR` | Stripe/Supabase API error |

**Example Error Response:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token."
  }
}
```

---

## Testing with cURL

### Get Products (Authenticated)

```bash
curl -X GET "http://localhost:3000/stripe/products?active=true&limit=10" \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN"
```

### Create Customer (Authenticated)

```bash
curl -X POST "http://localhost:3000/stripe/customer" \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

### Test Webhook (Local - requires raw signature)

```bash
# Use Stripe CLI instead:
stripe trigger customer.created

# Or forward webhooks from Stripe CLI:
stripe listen --forward-to localhost:3000/webhooks/stripe
```

---

## Integration Examples

### Next.js Frontend

```typescript
// app/api/stripe/products/route.ts
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { getToken } = auth();
  const token = await getToken();

  const response = await fetch("http://localhost:3000/stripe/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return Response.json(data);
}
```

### React Native/Expo

```typescript
import { useAuth } from "@clerk/clerk-expo";

const ProductsList = () => {
  const { getToken } = useAuth();

  const fetchProducts = async () => {
    const token = await getToken();
    
    const response = await fetch("https://api.your-domain.com/stripe/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.data;
  };

  // ... rest of component
};
```

---

## Webhook Event Types

The webhook endpoint handles these Stripe event types:

### Customer Events
- `customer.created` - New customer created
- `customer.updated` - Customer details updated
- `customer.deleted` - Customer deleted

### Subscription Events
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

### Payment Events
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### Checkout Events
- `checkout.session.completed` - Checkout completed
- `checkout.session.expired` - Checkout session expired

**Note:** The backend logs unhandled event types but does not process them.

---

## Rate Limits

Currently no rate limiting implemented. Consider adding rate limiting for production:

- Authenticated endpoints: 100 requests/minute per user
- Webhook endpoint: 1000 events/minute (Stripe-side limit)

---

## CORS Configuration

CORS is configured via `CORS_ORIGIN` environment variable:

```bash
# Single origin
CORS_ORIGIN=https://your-frontend.com

# Multiple origins (not supported - use proxy/API gateway)
```

Allowed methods: `GET`, `POST`, `OPTIONS`

---

## Security Headers

All responses include:
- `Content-Type: application/json` (except health check)
- Standard CORS headers based on `CORS_ORIGIN`

---

## Monitoring

### Health Check

Monitor API availability:

```bash
# Should return "OK"
curl http://localhost:3000/
```

### Webhook Status

Check Stripe Dashboard for webhook delivery status:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your endpoint
3. View event log for success/failure rates

### Database Queries

Check processed webhooks in Supabase:

```sql
-- Recent webhook events
SELECT * FROM stripe_webhook_events
ORDER BY created_at DESC
LIMIT 10;

-- Event counts by type
SELECT event_type, COUNT(*) as count
FROM stripe_webhook_events
GROUP BY event_type
ORDER BY count DESC;
```

---

## Additional Resources

- **Full Documentation:** [docs/backend/README.md](./README.md)
- **Setup Guide:** [docs/backend/07-webhook-setup-guide.md](./07-webhook-setup-guide.md)
- **API Design Spec:** [docs/backend/03-api-design.md](./03-api-design.md)
- **Security Best Practices:** [docs/backend/05-security-and-best-practices.md](./05-security-and-best-practices.md)

---

**Quick Reference Complete!** For detailed information, refer to the full documentation.
