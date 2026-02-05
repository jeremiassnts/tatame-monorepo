#!/bin/bash

# =====================================================
# API Testing Script
# =====================================================
# Description: Test all API endpoints for the Tatame backend
# Usage: ./scripts/test-api.sh [CLERK_JWT_TOKEN]
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
CLERK_TOKEN="${1:-}"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Tatame Backend API Testing${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Helper function to make requests
make_request() {
  local method=$1
  local endpoint=$2
  local auth_required=$3
  local body=$4
  local description=$5

  echo -e "${YELLOW}Testing:${NC} $description"
  echo -e "${BLUE}  $method $endpoint${NC}"

  if [ "$auth_required" = "true" ]; then
    if [ -z "$CLERK_TOKEN" ]; then
      echo -e "${RED}  ❌ SKIPPED - No Clerk token provided${NC}"
      echo ""
      return
    fi

    if [ -n "$body" ]; then
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $CLERK_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$body")
    else
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $CLERK_TOKEN")
    fi
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}  ✅ Success ($http_code)${NC}"
    echo "  Response: $body" | head -c 200
    if [ ${#body} -gt 200 ]; then echo "..."; fi
  elif [ "$http_code" -eq 401 ]; then
    echo -e "${YELLOW}  ⚠️  Unauthorized ($http_code) - Expected for protected routes${NC}"
    echo "  Response: $body"
  else
    echo -e "${RED}  ❌ Failed ($http_code)${NC}"
    echo "  Response: $body"
  fi

  echo ""
}

# =====================================================
# Test Cases
# =====================================================

echo -e "${BLUE}1. Public Endpoints${NC}"
echo ""

make_request "GET" "/" false "" "Health check"

echo -e "${BLUE}2. Protected Endpoints (Require Auth)${NC}"
echo ""

make_request "GET" "/stripe/products" true "" "List all products"
make_request "GET" "/stripe/products?active=true&limit=5" true "" "List active products (limited)"
make_request "GET" "/stripe/prices" true "" "List all prices"
make_request "GET" "/stripe/prices?active=true&limit=5" true "" "List active prices (limited)"

echo -e "${BLUE}3. Customer Management${NC}"
echo ""

customer_body='{"email":"test@example.com","name":"Test User"}'
make_request "POST" "/stripe/customer" true "$customer_body" "Create/get customer"

echo -e "${BLUE}4. Test Without Authentication${NC}"
echo ""

# Temporarily clear token to test 401 responses
temp_token=$CLERK_TOKEN
CLERK_TOKEN=""

make_request "GET" "/stripe/products" true "" "Products without auth (should fail)"

CLERK_TOKEN=$temp_token

# =====================================================
# Summary
# =====================================================

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Testing Complete${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

if [ -z "$CLERK_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  Note: Protected endpoint tests were skipped${NC}"
  echo -e "${YELLOW}   Run with Clerk token: ./test-api.sh YOUR_TOKEN${NC}"
else
  echo -e "${GREEN}✅ All tests completed with authentication${NC}"
fi

echo ""
echo "Next steps:"
echo "1. Check responses above for errors"
echo "2. Test webhooks with: stripe trigger customer.created"
echo "3. Review logs in server output"
echo ""
