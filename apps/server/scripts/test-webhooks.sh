#!/bin/bash

# =====================================================
# Webhook Testing Script
# =====================================================
# Description: Test Stripe webhook integration
# Prerequisites: Stripe CLI installed and authenticated
# Usage: ./scripts/test-webhooks.sh
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Stripe Webhook Testing${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}❌ Stripe CLI not found${NC}"
    echo ""
    echo "Install Stripe CLI:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Other: https://stripe.com/docs/stripe-cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Stripe CLI found${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}Checking if server is running...${NC}"
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo ""
    echo "Start the server first:"
    echo "  pnpm dev"
    echo ""
    exit 1
fi

echo ""

# Test webhook events
echo -e "${BLUE}Testing Webhook Events${NC}"
echo ""

test_event() {
  local event_type=$1
  local description=$2

  echo -e "${YELLOW}Triggering:${NC} $description"
  echo -e "${BLUE}  Event: $event_type${NC}"
  
  if stripe trigger "$event_type" --skip-webhook-test > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Event sent successfully${NC}"
  else
    echo -e "${RED}  ❌ Failed to send event${NC}"
  fi
  
  echo ""
  sleep 1
}

echo -e "${YELLOW}📝 Customer Events${NC}"
echo ""
test_event "customer.created" "Customer created"
test_event "customer.updated" "Customer updated"

echo -e "${YELLOW}📝 Subscription Events${NC}"
echo ""
test_event "customer.subscription.created" "Subscription created"
test_event "customer.subscription.updated" "Subscription updated"
test_event "customer.subscription.deleted" "Subscription deleted"

echo -e "${YELLOW}📝 Payment Events${NC}"
echo ""
test_event "invoice.payment_succeeded" "Invoice payment succeeded"
test_event "invoice.payment_failed" "Invoice payment failed"

echo -e "${YELLOW}📝 Checkout Events${NC}"
echo ""
test_event "checkout.session.completed" "Checkout session completed"

# =====================================================
# Summary and Next Steps
# =====================================================

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Testing Complete${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

echo "Next steps:"
echo ""
echo "1. Check server logs to verify events were received and processed"
echo "2. Query Supabase to verify events were stored:"
echo ""
echo -e "${BLUE}   SELECT * FROM stripe_webhook_events ORDER BY created_at DESC LIMIT 10;${NC}"
echo ""
echo "3. Test idempotency by resending an event from Stripe Dashboard"
echo "4. Monitor webhook delivery in Stripe Dashboard:"
echo ""
echo -e "${BLUE}   https://dashboard.stripe.com/test/webhooks${NC}"
echo ""

echo -e "${GREEN}✅ All webhook test events sent!${NC}"
echo ""
