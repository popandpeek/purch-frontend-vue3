#!/bin/bash

# Backend API Test Script
# This script tests the vendor selection API endpoints

echo "Testing Backend Vendor Selection APIs..."
echo "========================================"

# Base URL for the API
BASE_URL="http://localhost:8000/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X PUT -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
        if [ -f /tmp/response.json ]; then
            echo "Response preview:"
            head -5 /tmp/response.json | sed 's/^/  /'
        fi
    elif [ "$http_code" = "404" ]; then
        echo -e "${YELLOW}⚠ Not Implemented (HTTP $http_code)${NC}"
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        if [ -f /tmp/response.json ]; then
            echo "Error response:"
            cat /tmp/response.json | sed 's/^/  /'
        fi
    fi
    echo
}

# Test 1: Health check
echo "1. Backend Health Check"
test_endpoint "GET" "/health" "Backend health check"

# Test 2: Get vendor selections for order 1
echo "2. Vendor Selections"
test_endpoint "GET" "/house-orders/1/vendor-selections" "Get vendor selections for order 1"

# Test 3: Get configuration inheritance for order item 1
echo "3. Configuration Inheritance"
test_endpoint "GET" "/house-orders/items/1/config-inheritance" "Get config inheritance for order item 1"

# Test 4: Override vendor selection
echo "4. Override Vendor Selection"
override_data='{"vendor_item_id": 2}'
test_endpoint "POST" "/house-orders/items/1/override-vendor-selection" "Override vendor selection for order item 1" "$override_data"

# Test 5: Update vendor selection config
echo "5. Update Vendor Selection Config"
config_data='{
    "strategy": "best_value",
    "min_order_threshold": 50,
    "delivery_priority": true,
    "quality_preference": "premium",
    "organic_preference": 0.8,
    "preferred_vendor_ids": [1, 3],
    "brand_preference": "Organic",
    "max_price_multiplier": 1.5
}'
test_endpoint "PUT" "/vendor-selection-config/order/1" "Update order-level vendor selection config" "$config_data"

# Test 6: Get all house orders (existing endpoint)
echo "6. Existing Endpoints"
test_endpoint "GET" "/house-orders/" "Get all house orders"

# Test 7: Get all vendors (existing endpoint)
test_endpoint "GET" "/vendors/" "Get all vendors"

echo "========================================"
echo "API Testing Complete!"

# Clean up
rm -f /tmp/response.json
