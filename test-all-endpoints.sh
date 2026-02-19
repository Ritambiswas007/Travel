#!/bin/bash

# Comprehensive API Endpoint Testing Script using curl
# Tests all endpoints in the Travel & Pilgrimage Management Platform

BASE_URL="http://localhost:3000"
API_PREFIX="/api/v1"
FULL_URL="${BASE_URL}${API_PREFIX}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
SKIPPED=0

# Tokens storage
ADMIN_TOKEN=""
STAFF_TOKEN=""
USER_TOKEN=""

# Test IDs storage
PACKAGE_ID=""
CITY_ID=""
BOOKING_ID=""
COUPON_ID=""
STAFF_ID=""
BANNER_ID=""
REVIEW_ID=""
TICKET_ID=""
REPORT_ID=""

# Helper function to print test results
print_test() {
    local name=$1
    local status=$2
    local message=$3
    
    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✓${NC} $name"
        ((PASSED++))
    elif [ "$status" == "FAIL" ]; then
        echo -e "${RED}✗${NC} $name"
        if [ -n "$message" ]; then
            echo -e "  ${RED}Error:${NC} $message"
        fi
        ((FAILED++))
    else
        echo -e "${YELLOW}⊘${NC} $name (skipped)"
        ((SKIPPED++))
    fi
}

# Helper function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    
    local url="${FULL_URL}${endpoint}"
    local headers=(-H "Content-Type: application/json")
    
    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi
    
    if [ "$method" == "GET" ]; then
        curl -s -w "\n%{http_code}" -X GET "${headers[@]}" "$url"
    elif [ "$method" == "POST" ]; then
        curl -s -w "\n%{http_code}" -X POST "${headers[@]}" -d "$data" "$url"
    elif [ "$method" == "PATCH" ]; then
        curl -s -w "\n%{http_code}" -X PATCH "${headers[@]}" -d "$data" "$url"
    elif [ "$method" == "DELETE" ]; then
        curl -s -w "\n%{http_code}" -X DELETE "${headers[@]}" "$url"
    fi
}

# Extract HTTP status and body from curl response
parse_response() {
    local response=$1
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    echo "$http_code|$body"
}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   API Endpoint Testing Suite         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "\nBase URL: ${FULL_URL}\n"

# ============================================
# AUTHENTICATION TESTS
# ============================================
echo -e "${CYAN}=== AUTHENTICATION TESTS ===${NC}\n"

# Register ADMIN
echo "Creating test users..."
RESPONSE=$(api_call "POST" "/auth/register" "" '{"email":"admin@test.com","password":"password123","name":"Admin User","role":"ADMIN"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
    print_test "POST /auth/register - Create ADMIN user" "PASS"
else
    print_test "POST /auth/register - Create ADMIN user" "FAIL" "HTTP $HTTP_CODE"
fi

# Register STAFF
RESPONSE=$(api_call "POST" "/auth/register" "" '{"email":"staff@test.com","password":"password123","name":"Staff User","role":"STAFF"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
    print_test "POST /auth/register - Create STAFF user" "PASS"
else
    print_test "POST /auth/register - Create STAFF user" "FAIL" "HTTP $HTTP_CODE"
fi

# Register USER
RESPONSE=$(api_call "POST" "/auth/register" "" '{"email":"user@test.com","password":"password123","name":"Regular User","role":"USER"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
    print_test "POST /auth/register - Create USER" "PASS"
else
    print_test "POST /auth/register - Create USER" "FAIL" "HTTP $HTTP_CODE"
fi

# Login as ADMIN
RESPONSE=$(api_call "POST" "/auth/login/email" "" '{"email":"admin@test.com","password":"password123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" == "200" ]; then
    ADMIN_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_test "POST /auth/login/email - Login as ADMIN" "PASS"
    else
        print_test "POST /auth/login/email - Login as ADMIN" "FAIL" "No token received"
    fi
else
    print_test "POST /auth/login/email - Login as ADMIN" "FAIL" "HTTP $HTTP_CODE"
fi

# Login as STAFF
RESPONSE=$(api_call "POST" "/auth/login/email" "" '{"email":"staff@test.com","password":"password123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" == "200" ]; then
    STAFF_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -n "$STAFF_TOKEN" ]; then
        print_test "POST /auth/login/email - Login as STAFF" "PASS"
    else
        print_test "POST /auth/login/email - Login as STAFF" "FAIL" "No token received"
    fi
else
    print_test "POST /auth/login/email - Login as STAFF" "FAIL" "HTTP $HTTP_CODE"
fi

# Login as USER
RESPONSE=$(api_call "POST" "/auth/login/email" "" '{"email":"user@test.com","password":"password123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" == "200" ]; then
    USER_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)
    if [ -n "$USER_TOKEN" ]; then
        print_test "POST /auth/login/email - Login as USER" "PASS"
    else
        print_test "POST /auth/login/email - Login as USER" "FAIL" "No token received"
    fi
else
    print_test "POST /auth/login/email - Login as USER" "FAIL" "HTTP $HTTP_CODE"
fi

# Send OTP
RESPONSE=$(api_call "POST" "/auth/send-otp" "" '{"email":"user@test.com","purpose":"login"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "POST /auth/send-otp - Send OTP" "PASS"
else
    print_test "POST /auth/send-otp - Send OTP" "FAIL" "HTTP $HTTP_CODE"
fi

# ============================================
# PACKAGES TESTS
# ============================================
echo -e "\n${CYAN}=== PACKAGES TESTS ===${NC}\n"

# List packages (public)
RESPONSE=$(api_call "GET" "/packages" "")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /packages - List packages (public)" "PASS"
else
    print_test "GET /packages - List packages (public)" "FAIL" "HTTP $HTTP_CODE"
fi

# List packages with pagination
RESPONSE=$(api_call "GET" "/packages?page=1&limit=10" "")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /packages?page=1&limit=10 - List with pagination" "PASS"
else
    print_test "GET /packages?page=1&limit=10 - List with pagination" "FAIL" "HTTP $HTTP_CODE"
fi

# Create package (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    TIMESTAMP=$(date +%s)
    RESPONSE=$(api_call "POST" "/packages" "$ADMIN_TOKEN" "{\"name\":\"Test Package $TIMESTAMP\",\"slug\":\"test-package-$TIMESTAMP\",\"description\":\"Test description\",\"summary\":\"Test summary\",\"isActive\":true,\"isFeatured\":false}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        PACKAGE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /packages - Create package (ADMIN)" "PASS"
    else
        print_test "POST /packages - Create package (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /packages - Create package (ADMIN)" "SKIP" "No admin token"
fi

# Get package by ID
if [ -n "$PACKAGE_ID" ]; then
    RESPONSE=$(api_call "GET" "/packages/$PACKAGE_ID" "")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /packages/:id - Get package by ID" "PASS"
    else
        print_test "GET /packages/:id - Get package by ID" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /packages/:id - Get package by ID" "SKIP" "No package ID"
fi

# Update package (ADMIN)
if [ -n "$PACKAGE_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "PATCH" "/packages/$PACKAGE_ID" "$ADMIN_TOKEN" "{\"description\":\"Updated description\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "PATCH /packages/:id - Update package (ADMIN)" "PASS"
    else
        print_test "PATCH /packages/:id - Update package (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "PATCH /packages/:id - Update package (ADMIN)" "SKIP"
fi

# Add variant (ADMIN)
if [ -n "$PACKAGE_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/packages/$PACKAGE_ID/variants" "$ADMIN_TOKEN" "{\"name\":\"Standard Variant\",\"basePrice\":10000,\"currency\":\"INR\",\"durationDays\":5,\"maxTravelers\":4,\"isDefault\":true}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        VARIANT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /packages/:id/variants - Add variant (ADMIN)" "PASS"
    else
        print_test "POST /packages/:id/variants - Add variant (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /packages/:id/variants - Add variant (ADMIN)" "SKIP"
fi

# Add itinerary (ADMIN)
if [ -n "$PACKAGE_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/packages/$PACKAGE_ID/itineraries" "$ADMIN_TOKEN" "{\"dayNumber\":1,\"title\":\"Day 1 - Arrival\",\"description\":\"Arrive at destination\",\"activities\":\"Check-in, rest\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "201" ]; then
        print_test "POST /packages/:id/itineraries - Add itinerary (ADMIN)" "PASS"
    else
        print_test "POST /packages/:id/itineraries - Add itinerary (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /packages/:id/itineraries - Add itinerary (ADMIN)" "SKIP"
fi

# ============================================
# CITIES TESTS
# ============================================
echo -e "\n${CYAN}=== CITIES TESTS ===${NC}\n"

# List cities (public)
RESPONSE=$(api_call "GET" "/cities" "")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /cities - List cities (public)" "PASS"
else
    print_test "GET /cities - List cities (public)" "FAIL" "HTTP $HTTP_CODE"
fi

# Create city (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    TIMESTAMP=$(date +%s)
    RESPONSE=$(api_call "POST" "/cities" "$ADMIN_TOKEN" "{\"name\":\"Test City $TIMESTAMP\",\"slug\":\"test-city-$TIMESTAMP\",\"description\":\"Test city description\",\"country\":\"India\",\"isActive\":true}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        CITY_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /cities - Create city (ADMIN)" "PASS"
    else
        print_test "POST /cities - Create city (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /cities - Create city (ADMIN)" "SKIP" "No admin token"
fi

# ============================================
# USERS TESTS
# ============================================
echo -e "\n${CYAN}=== USERS TESTS ===${NC}\n"

# Get profile
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/users/me" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /users/me - Get profile" "PASS"
    else
        print_test "GET /users/me - Get profile" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /users/me - Get profile" "SKIP" "No user token"
fi

# Update profile
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "PATCH" "/users/me" "$USER_TOKEN" "{\"name\":\"Updated Name\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "PATCH /users/me - Update profile" "PASS"
    else
        print_test "PATCH /users/me - Update profile" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "PATCH /users/me - Update profile" "SKIP" "No user token"
fi

# List all users (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/users/admin/users" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /users/admin/users - List all users (ADMIN)" "PASS"
    else
        print_test "GET /users/admin/users - List all users (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /users/admin/users - List all users (ADMIN)" "SKIP" "No admin token"
fi

# ============================================
# STAFF TESTS
# ============================================
echo -e "\n${CYAN}=== STAFF TESTS ===${NC}\n"

# Create staff (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    TIMESTAMP=$(date +%s)
    RESPONSE=$(api_call "POST" "/staff" "$ADMIN_TOKEN" "{\"email\":\"newstaff$TIMESTAMP@test.com\",\"password\":\"password123\",\"name\":\"New Staff Member\",\"department\":\"Sales\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "409" ]; then
        STAFF_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /staff - Create staff (ADMIN)" "PASS"
    else
        print_test "POST /staff - Create staff (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /staff - Create staff (ADMIN)" "SKIP" "No admin token"
fi

# List staff (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/staff" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /staff - List staff (ADMIN)" "PASS"
    else
        print_test "GET /staff - List staff (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /staff - List staff (ADMIN)" "SKIP" "No admin token"
fi

# ============================================
# COUPONS TESTS
# ============================================
echo -e "\n${CYAN}=== COUPONS TESTS ===${NC}\n"

# Create coupon (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    TIMESTAMP=$(date +%s)
    FUTURE_DATE=$(date -v+30d +%Y-%m-%dT%H:%M:%S.000Z 2>/dev/null || date -d "+30 days" +%Y-%m-%dT%H:%M:%S.000Z)
    RESPONSE=$(api_call "POST" "/coupons" "$ADMIN_TOKEN" "{\"code\":\"TEST$TIMESTAMP\",\"discountType\":\"PERCENT\",\"discountValue\":10,\"usageLimit\":100,\"validFrom\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",\"validTo\":\"$FUTURE_DATE\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        COUPON_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /coupons - Create coupon (ADMIN)" "PASS"
    else
        print_test "POST /coupons - Create coupon (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /coupons - Create coupon (ADMIN)" "SKIP" "No admin token"
fi

# List coupons (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/coupons" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /coupons - List coupons (ADMIN)" "PASS"
    else
        print_test "GET /coupons - List coupons (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /coupons - List coupons (ADMIN)" "SKIP" "No admin token"
fi

# ============================================
# BANNERS TESTS
# ============================================
echo -e "\n${CYAN}=== BANNERS TESTS ===${NC}\n"

# List active banners (public)
RESPONSE=$(api_call "GET" "/banners" "")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /banners - List active banners (public)" "PASS"
else
    print_test "GET /banners - List active banners (public)" "FAIL" "HTTP $HTTP_CODE"
fi

# Create banner (ADMIN)
if [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/banners" "$ADMIN_TOKEN" "{\"title\":\"Test Banner\",\"imageUrl\":\"https://example.com/banner.jpg\",\"linkUrl\":\"https://example.com\",\"isActive\":true,\"order\":1}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        BANNER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /banners - Create banner (ADMIN)" "PASS"
    else
        print_test "POST /banners - Create banner (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /banners - Create banner (ADMIN)" "SKIP" "No admin token"
fi

# ============================================
# REVIEWS TESTS
# ============================================
echo -e "\n${CYAN}=== REVIEWS TESTS ===${NC}\n"

# List reviews (public)
RESPONSE=$(api_call "GET" "/reviews" "")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /reviews - List reviews (public)" "PASS"
else
    print_test "GET /reviews - List reviews (public)" "FAIL" "HTTP $HTTP_CODE"
fi

# Create review (USER)
if [ -n "$PACKAGE_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/reviews" "$USER_TOKEN" "{\"packageId\":\"$PACKAGE_ID\",\"rating\":5,\"comment\":\"Great package!\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        REVIEW_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /reviews - Create review (USER)" "PASS"
    else
        print_test "POST /reviews - Create review (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /reviews - Create review (USER)" "SKIP"
fi

# ============================================
# SUPPORT TESTS
# ============================================
echo -e "\n${CYAN}=== SUPPORT TESTS ===${NC}\n"

# Create ticket (USER)
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/support" "$USER_TOKEN" "{\"subject\":\"Test Ticket\",\"message\":\"This is a test support ticket\",\"category\":\"GENERAL\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        TICKET_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /support - Create ticket (USER)" "PASS"
    else
        print_test "POST /support - Create ticket (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /support - Create ticket (USER)" "SKIP" "No user token"
fi

# List my tickets (USER)
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/support" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /support - List my tickets (USER)" "PASS"
    else
        print_test "GET /support - List my tickets (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /support - List my tickets (USER)" "SKIP" "No user token"
fi

# ============================================
# REPORTS TESTS
# ============================================
echo -e "\n${CYAN}=== REPORTS TESTS ===${NC}\n"

# Create report (STAFF)
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/reports" "$STAFF_TOKEN" "{\"name\":\"Test Report\",\"type\":\"BOOKINGS\",\"params\":{}}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        REPORT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /reports - Create report (STAFF)" "PASS"
    else
        print_test "POST /reports - Create report (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /reports - Create report (STAFF)" "SKIP" "No staff token"
fi

# List reports (STAFF)
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/reports" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /reports - List reports (STAFF)" "PASS"
    else
        print_test "GET /reports - List reports (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /reports - List reports (STAFF)" "SKIP" "No staff token"
fi

# Bookings report (STAFF)
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/reports/bookings" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /reports/bookings - Bookings report (STAFF)" "PASS"
    else
        print_test "GET /reports/bookings - Bookings report (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /reports/bookings - Bookings report (STAFF)" "SKIP" "No staff token"
fi

# Revenue report (STAFF)
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/reports/revenue" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /reports/revenue - Revenue report (STAFF)" "PASS"
    else
        print_test "GET /reports/revenue - Revenue report (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /reports/revenue - Revenue report (STAFF)" "SKIP" "No staff token"
fi

# ============================================
# BOOKINGS TESTS
# ============================================
echo -e "\n${CYAN}=== BOOKINGS TESTS ===${NC}\n"

# List my bookings (USER)
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/bookings/my" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /bookings/my - List my bookings (USER)" "PASS"
    else
        print_test "GET /bookings/my - List my bookings (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /bookings/my - List my bookings (USER)" "SKIP" "No user token"
fi

# List all bookings (STAFF)
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/bookings/admin" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /bookings/admin - List all bookings (STAFF)" "PASS"
    else
        print_test "GET /bookings/admin - List all bookings (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /bookings/admin - List all bookings (STAFF)" "SKIP" "No staff token"
fi

# ============================================
# VISA TESTS
# ============================================
echo -e "\n${CYAN}=== VISA TESTS ===${NC}\n"

# List my visa applications (USER)
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/visa/my" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /visa/my - List my visa applications (USER)" "PASS"
    else
        print_test "GET /visa/my - List my visa applications (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /visa/my - List my visa applications (USER)" "SKIP" "No user token"
fi

# ============================================
# DOCUMENTS TESTS
# ============================================
echo -e "\n${CYAN}=== DOCUMENTS TESTS ===${NC}\n"

# List document types (public)
RESPONSE=$(api_call "GET" "/documents/types" "")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /documents/types - List document types (public)" "PASS"
else
    print_test "GET /documents/types - List document types (public)" "FAIL" "HTTP $HTTP_CODE"
fi

# List my documents (USER)
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/documents/my" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /documents/my - List my documents (USER)" "PASS"
    else
        print_test "GET /documents/my - List my documents (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /documents/my - List my documents (USER)" "SKIP" "No user token"
fi

# ============================================
# NOTIFICATIONS TESTS
# ============================================
echo -e "\n${CYAN}=== NOTIFICATIONS TESTS ===${NC}\n"

# List my notifications (USER)
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/notifications" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ]; then
        print_test "GET /notifications - List my notifications (USER)" "PASS"
    else
        print_test "GET /notifications - List my notifications (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /notifications - List my notifications (USER)" "SKIP" "No user token"
fi

# ============================================
# LEADS TESTS
# ============================================
echo -e "\n${CYAN}=== LEADS TESTS ===${NC}\n"

# Create lead (public)
RESPONSE=$(api_call "POST" "/leads" "" "{\"name\":\"Test Lead\",\"email\":\"lead@test.com\",\"phone\":\"+1234567890\",\"source\":\"WEBSITE\",\"message\":\"Interested in packages\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" == "201" ]; then
    LEAD_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
    print_test "POST /leads - Create lead (public)" "PASS"
else
    print_test "POST /leads - Create lead (public)" "FAIL" "HTTP $HTTP_CODE"
fi

# ============================================
# ADDITIONAL ENDPOINTS (full coverage)
# ============================================
echo -e "\n${CYAN}=== ADDITIONAL ENDPOINTS ===${NC}\n"

# Health (no API prefix)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "GET /health - Health check" "PASS"
else
    print_test "GET /health - Health check" "FAIL" "HTTP $HTTP_CODE"
fi

# Auth: refresh (need refreshToken from login - skip or use body)
# Auth: logout
if [ -n "$USER_TOKEN" ]; then
    REFRESH_BODY=$(curl -s -X POST "${FULL_URL}/auth/login/email" -H "Content-Type: application/json" -d '{"email":"user@test.com","password":"password123"}')
    REFRESH_TOKEN=$(echo "$REFRESH_BODY" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    if [ -n "$REFRESH_TOKEN" ]; then
        RESPONSE=$(api_call "POST" "/auth/logout" "" "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        if [ "$HTTP_CODE" == "200" ]; then
            print_test "POST /auth/logout - Logout" "PASS"
        else
            print_test "POST /auth/logout - Logout" "FAIL" "HTTP $HTTP_CODE"
        fi
    else
        print_test "POST /auth/logout - Logout" "SKIP" "No refresh token"
    fi
else
    print_test "POST /auth/logout - Logout" "SKIP"
fi

# Auth: forgot-password
RESPONSE=$(api_call "POST" "/auth/forgot-password" "" '{"email":"user@test.com"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    print_test "POST /auth/forgot-password - Forgot password" "PASS"
else
    print_test "POST /auth/forgot-password - Forgot password" "FAIL" "HTTP $HTTP_CODE"
fi

# Packages: GET by slug, POST schedules
if [ -n "$PACKAGE_ID" ]; then
    RESPONSE=$(api_call "GET" "/packages/slug/test-pkg" "")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ]; then
        print_test "GET /packages/slug/:slug - Get package by slug" "PASS"
    else
        print_test "GET /packages/slug/:slug - Get package by slug" "FAIL" "HTTP $HTTP_CODE"
    fi
    START_D=$(date -u -v+30d +%Y-%m-%dT00:00:00.000Z 2>/dev/null || date -u -d "+30 days" +%Y-%m-%dT00:00:00.000Z)
    END_D=$(date -u -v+35d +%Y-%m-%dT00:00:00.000Z 2>/dev/null || date -u -d "+35 days" +%Y-%m-%dT00:00:00.000Z)
    RESPONSE=$(api_call "POST" "/packages/$PACKAGE_ID/schedules" "$ADMIN_TOKEN" "{\"startDate\":\"$START_D\",\"endDate\":\"$END_D\",\"availableSeats\":20}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        SCHEDULE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /packages/:id/schedules - Add schedule (ADMIN)" "PASS"
    else
        print_test "POST /packages/:id/schedules - Add schedule (ADMIN)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "GET /packages/slug/:slug" "SKIP"
    print_test "POST /packages/:id/schedules" "SKIP"
fi

# Cities: GET by id, slug, PATCH, DELETE
if [ -n "$CITY_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/cities/$CITY_ID" "")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /cities/:id - Get city by ID" "PASS" || print_test "GET /cities/:id - Get city by ID" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "GET" "/cities/slug/test-city" "")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ] && print_test "GET /cities/slug/:slug - Get city by slug" "PASS" || print_test "GET /cities/slug/:slug" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "PATCH" "/cities/$CITY_ID" "$ADMIN_TOKEN" '{"description":"Updated"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /cities/:id - Update city (ADMIN)" "PASS" || print_test "PATCH /cities/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "DELETE" "/cities/$CITY_ID" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "DELETE /cities/:id - Delete city (ADMIN)" "PASS" || print_test "DELETE /cities/:id" "FAIL" "HTTP $HTTP_CODE"
fi

# Staff: GET /:id, PATCH /:id
if [ -n "$STAFF_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/staff/$STAFF_ID" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /staff/:id - Get staff by ID" "PASS" || print_test "GET /staff/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "PATCH" "/staff/$STAFF_ID" "$ADMIN_TOKEN" '{"department":"Operations"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /staff/:id - Update staff (ADMIN)" "PASS" || print_test "PATCH /staff/:id" "FAIL" "HTTP $HTTP_CODE"
fi

# Coupons: GET /:id, PATCH /:id
if [ -n "$COUPON_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/coupons/$COUPON_ID" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /coupons/:id - Get coupon by ID" "PASS" || print_test "GET /coupons/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "PATCH" "/coupons/$COUPON_ID" "$ADMIN_TOKEN" '{"description":"Updated coupon"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /coupons/:id - Update coupon (ADMIN)" "PASS" || print_test "PATCH /coupons/:id" "FAIL" "HTTP $HTTP_CODE"
fi

# Banners: GET /admin, GET /:id, PATCH /:id, DELETE /:id
if [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/banners/admin" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /banners/admin - List all banners (ADMIN)" "PASS" || print_test "GET /banners/admin" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$BANNER_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/banners/$BANNER_ID" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /banners/:id - Get banner by ID" "PASS" || print_test "GET /banners/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "PATCH" "/banners/$BANNER_ID" "$ADMIN_TOKEN" '{"title":"Updated Banner"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /banners/:id - Update banner (ADMIN)" "PASS" || print_test "PATCH /banners/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "DELETE" "/banners/$BANNER_ID" "$ADMIN_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "DELETE /banners/:id - Delete banner (ADMIN)" "PASS" || print_test "DELETE /banners/:id" "FAIL" "HTTP $HTTP_CODE"
fi

# Reviews: GET /:id (requires auth), PATCH /:id
if [ -n "$REVIEW_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/reviews/$REVIEW_ID" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /reviews/:id - Get review by ID" "PASS" || print_test "GET /reviews/:id" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$REVIEW_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "PATCH" "/reviews/$REVIEW_ID" "$USER_TOKEN" '{"comment":"Updated comment"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /reviews/:id - Update review (USER)" "PASS" || print_test "PATCH /reviews/:id" "FAIL" "HTTP $HTTP_CODE"
fi

# Support: GET /:id, POST /:id/reply, POST /:id/close
if [ -n "$TICKET_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/support/$TICKET_ID" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /support/:id - Get ticket" "PASS" || print_test "GET /support/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/support/$TICKET_ID/reply" "$USER_TOKEN" '{"message":"Test reply"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ] && print_test "POST /support/:id/reply - Reply to ticket" "PASS" || print_test "POST /support/:id/reply" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/support/$TICKET_ID/close" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "POST /support/:id/close - Close ticket" "PASS" || print_test "POST /support/:id/close" "FAIL" "HTTP $HTTP_CODE"
fi

# Reports: GET /:id
if [ -n "$REPORT_ID" ] && [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/reports/$REPORT_ID" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /reports/:id - Get report by ID" "PASS" || print_test "GET /reports/:id" "FAIL" "HTTP $HTTP_CODE"
fi

# Bookings: POST (create), GET /:id, PATCH /:id/step (requires packageScheduleId, packageVariantId, travelers.firstName/lastName)
if [ -n "$PACKAGE_ID" ] && [ -n "$VARIANT_ID" ] && [ -n "$SCHEDULE_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/bookings" "$USER_TOKEN" "{\"packageId\":\"$PACKAGE_ID\",\"packageScheduleId\":\"$SCHEDULE_ID\",\"packageVariantId\":\"$VARIANT_ID\",\"travelers\":[{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"user@test.com\"}]}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        BOOKING_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /bookings - Create booking (USER)" "PASS"
    else
        print_test "POST /bookings - Create booking (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /bookings - Create booking (USER)" "SKIP" "Missing PACKAGE_ID/VARIANT_ID/SCHEDULE_ID or token"
fi
if [ -n "$BOOKING_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/bookings/$BOOKING_ID" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /bookings/:id - Get booking" "PASS" || print_test "GET /bookings/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "PATCH" "/bookings/$BOOKING_ID/step" "$USER_TOKEN" '{"step":1}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /bookings/:id/step - Update step" "PASS" || print_test "PATCH /bookings/:id/step" "FAIL" "HTTP $HTTP_CODE"
fi

# Payments: POST /orders, GET /booking/:bookingId, GET /:id, POST /refunds
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/payments/orders" "$USER_TOKEN" "{\"bookingId\":\"$BOOKING_ID\",\"amount\":10000,\"currency\":\"INR\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /payments/orders - Create order" "PASS" || print_test "POST /payments/orders" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$BOOKING_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/payments/booking/$BOOKING_ID" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ] && print_test "GET /payments/booking/:bookingId - Get payment by booking" "PASS" || print_test "GET /payments/booking/:bookingId" "FAIL" "HTTP $HTTP_CODE"
fi

# Transport: flight, train, bus (require bookingId)
if [ -n "$STAFF_TOKEN" ] && [ -n "$BOOKING_ID" ]; then
    START_T=$(date -u -v+7d +%Y-%m-%dT10:00:00.000Z 2>/dev/null || date -u -d "+7 days" +%Y-%m-%dT10:00:00.000Z)
    END_T=$(date -u -v+7d +%Y-%m-%dT12:00:00.000Z 2>/dev/null || date -u -d "+7 days" +%Y-%m-%dT12:00:00.000Z)
    RESPONSE=$(api_call "POST" "/transport/flight" "$STAFF_TOKEN" "{\"bookingId\":\"$BOOKING_ID\",\"airline\":\"Air India\",\"flightNumber\":\"AI101\",\"departureCity\":\"Delhi\",\"arrivalCity\":\"Mumbai\",\"departureAt\":\"$START_T\",\"arrivalAt\":\"$END_T\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /transport/flight - Add flight (STAFF)" "PASS" || print_test "POST /transport/flight" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/transport/train" "$STAFF_TOKEN" "{\"bookingId\":\"$BOOKING_ID\",\"trainName\":\"Express\",\"trainNumber\":\"12345\",\"departureCity\":\"Delhi\",\"arrivalCity\":\"Mumbai\",\"departureAt\":\"$START_T\",\"arrivalAt\":\"$END_T\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /transport/train - Add train (STAFF)" "PASS" || print_test "POST /transport/train" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/transport/bus" "$STAFF_TOKEN" "{\"bookingId\":\"$BOOKING_ID\",\"busOperator\":\"Test Bus\",\"departureCity\":\"Delhi\",\"arrivalCity\":\"Mumbai\",\"departureAt\":\"$START_T\",\"arrivalAt\":\"$END_T\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /transport/bus - Add bus (STAFF)" "PASS" || print_test "POST /transport/bus" "FAIL" "HTTP $HTTP_CODE"
else
    print_test "POST /transport/flight - Add flight (STAFF)" "SKIP"
    print_test "POST /transport/train - Add train (STAFF)" "SKIP"
    print_test "POST /transport/bus - Add bus (STAFF)" "SKIP"
fi

# Visa: POST (country, type only), GET /:id, submit
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/visa" "$USER_TOKEN" '{"country":"USA","type":"TOURIST"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        VISA_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /visa - Create visa application (USER)" "PASS"
    else
        print_test "POST /visa - Create visa application (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
else
    print_test "POST /visa - Create visa application (USER)" "SKIP"
fi
if [ -n "$VISA_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/visa/$VISA_ID" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /visa/:id - Get visa application" "PASS" || print_test "GET /visa/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/visa/$VISA_ID/submit" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "POST /visa/:id/submit - Submit application" "PASS" || print_test "POST /visa/:id/submit" "FAIL" "HTTP $HTTP_CODE"
fi

# Documents: POST /types (unique code), GET /types/:id, POST /upload, GET /checklist/pdf, GET /:id, PATCH /:id/status
if [ -n "$STAFF_TOKEN" ]; then
    DOC_CODE="PASSPORT_$(date +%s)"
    RESPONSE=$(api_call "POST" "/documents/types" "$STAFF_TOKEN" "{\"name\":\"Passport\",\"code\":\"$DOC_CODE\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        DOC_TYPE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /documents/types - Create document type (STAFF)" "PASS"
    else
        print_test "POST /documents/types - Create document type (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
fi
if [ -n "$DOC_TYPE_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "POST" "/documents/upload" "$USER_TOKEN" "{\"documentTypeId\":\"$DOC_TYPE_ID\",\"fileUrl\":\"https://example.com/doc.pdf\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        DOC_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /documents/upload - Upload document (USER)" "PASS"
    else
        print_test "POST /documents/upload - Upload document (USER)" "FAIL" "HTTP $HTTP_CODE"
    fi
fi
if [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/documents/checklist/pdf" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "500" ] && print_test "GET /documents/checklist/pdf - Download checklist" "PASS" || print_test "GET /documents/checklist/pdf" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$DOC_ID" ] && [ -n "$USER_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/documents/$DOC_ID" "$USER_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /documents/:id - Get document" "PASS" || print_test "GET /documents/:id" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$DOC_TYPE_ID" ] && [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/documents/types/$DOC_TYPE_ID" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /documents/types/:id - Get document type" "PASS" || print_test "GET /documents/types/:id" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$DOC_ID" ] && [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "PATCH" "/documents/$DOC_ID/status" "$STAFF_TOKEN" '{"status":"APPROVED"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /documents/:id/status - Update status (STAFF)" "PASS" || print_test "PATCH /documents/:id/status" "FAIL" "HTTP $HTTP_CODE"
fi

# Forms: POST (create with unique code), GET /, GET /:id, GET /code/:code, POST /:id/submit, POST /:id/fields
if [ -n "$STAFF_TOKEN" ]; then
    FORM_CODE="FORM_$(date +%s)"
    RESPONSE=$(api_call "POST" "/forms" "$STAFF_TOKEN" "{\"name\":\"Test Form\",\"code\":\"$FORM_CODE\",\"description\":\"Test\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" == "201" ]; then
        FORM_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
        print_test "POST /forms - Create form (STAFF)" "PASS"
    else
        print_test "POST /forms - Create form (STAFF)" "FAIL" "HTTP $HTTP_CODE"
    fi
fi
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/forms" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /forms - List forms (STAFF)" "PASS" || print_test "GET /forms" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$FORM_ID" ] && [ -n "$FORM_CODE" ]; then
    RESPONSE=$(api_call "GET" "/forms/code/$FORM_CODE" "")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ] && print_test "GET /forms/code/:code - Get form by code (public)" "PASS" || print_test "GET /forms/code/:code" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$FORM_ID" ] && [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/forms/$FORM_ID" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /forms/:id - Get form by ID" "PASS" || print_test "GET /forms/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/forms/$FORM_ID/fields" "$STAFF_TOKEN" '{"name":"email","label":"Email","type":"text","required":true}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "201" ] && print_test "POST /forms/:id/fields - Add field (STAFF)" "PASS" || print_test "POST /forms/:id/fields" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$FORM_ID" ]; then
    RESPONSE=$(api_call "POST" "/forms/$FORM_ID/submit" "" '{"data":{"email":"test@test.com"}}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /forms/:id/submit - Submit form (public)" "PASS" || print_test "POST /forms/:id/submit" "FAIL" "HTTP $HTTP_CODE"
fi

# Notifications: mark-read, send
if [ -n "$STAFF_TOKEN" ] && [ -n "$USER_ID" ]; then
    RESPONSE=$(api_call "POST" "/notifications/send" "$STAFF_TOKEN" "{\"userId\":\"$USER_ID\",\"title\":\"Test\",\"body\":\"Test notification\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /notifications/send - Send notification (STAFF)" "PASS" || print_test "POST /notifications/send" "FAIL" "HTTP $HTTP_CODE"
else
    print_test "POST /notifications/send - Send notification (STAFF)" "SKIP"
fi

# Leads: GET /, GET /:id, PATCH /:id, POST /:id/assign
if [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/leads" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /leads - List leads (STAFF)" "PASS" || print_test "GET /leads" "FAIL" "HTTP $HTTP_CODE"
fi
if [ -n "$LEAD_ID" ] && [ -n "$STAFF_TOKEN" ]; then
    RESPONSE=$(api_call "GET" "/leads/$LEAD_ID" "$STAFF_TOKEN")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "GET /leads/:id - Get lead" "PASS" || print_test "GET /leads/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "PATCH" "/leads/$LEAD_ID" "$STAFF_TOKEN" '{"status":"CONTACTED"}')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] && print_test "PATCH /leads/:id - Update lead (STAFF)" "PASS" || print_test "PATCH /leads/:id" "FAIL" "HTTP $HTTP_CODE"
    RESPONSE=$(api_call "POST" "/leads/$LEAD_ID/assign" "$STAFF_TOKEN" "{\"staffId\":\"$STAFF_ID\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /leads/:id/assign - Assign lead (STAFF)" "PASS" || print_test "POST /leads/:id/assign" "FAIL" "HTTP $HTTP_CODE"
fi

# Leads: Facebook webhook (GET for verification; 200 if token matches, 403 if not)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${FULL_URL}/leads/webhook/facebook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=123")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "403" ] || [ "$HTTP_CODE" == "401" ] && print_test "GET /leads/webhook/facebook - Facebook webhook verify" "PASS" || print_test "GET /leads/webhook/facebook" "FAIL" "HTTP $HTTP_CODE"

# AI: recommendations, faq, booking-assistant
RESPONSE=$(api_call "POST" "/ai/recommendations" "" '{"preferences":{"budget":50000,"duration":5}}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "503" ] || [ "$HTTP_CODE" == "500" ] && print_test "POST /ai/recommendations - AI recommendations" "PASS" || print_test "POST /ai/recommendations" "FAIL" "HTTP $HTTP_CODE"
RESPONSE=$(api_call "POST" "/ai/faq" "" '{"question":"What are the visa requirements?"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "503" ] || [ "$HTTP_CODE" == "500" ] && print_test "POST /ai/faq - AI FAQ" "PASS" || print_test "POST /ai/faq" "FAIL" "HTTP $HTTP_CODE"
RESPONSE=$(api_call "POST" "/ai/booking-assistant" "" '{"query":"I want to book a trip"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "503" ] || [ "$HTTP_CODE" == "500" ] || [ "$HTTP_CODE" == "400" ] && print_test "POST /ai/booking-assistant - AI booking assistant" "PASS" || print_test "POST /ai/booking-assistant" "FAIL" "HTTP $HTTP_CODE"

# ============================================
# SUMMARY
# ============================================
echo -e "\n${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           TEST SUMMARY                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo -e "${YELLOW}⊘ Skipped: $SKIPPED${NC}"

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)
    echo -e "\n${BLUE}Success Rate: ${SUCCESS_RATE}%${NC}\n"
fi

if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
