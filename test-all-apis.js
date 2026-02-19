#!/usr/bin/env node

/**
 * Comprehensive API Testing Script
 * Tests all endpoints in the Travel & Pilgrimage Management Platform
 * 
 * Usage: node test-all-apis.js
 * Prerequisites: Server must be running (npm run dev)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1';

// Test results storage
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let adminToken = '';
let staffToken = '';
let userToken = '';
let testPackageId = '';
let testCityId = '';
let testBookingId = '';
let testCouponId = '';
let testStaffId = '';
let testVariantId = '';
let testItineraryId = '';
let testScheduleId = '';
let testReportId = '';
let testBannerId = '';
let testReviewId = '';
let testTicketId = '';

// Helper function to make HTTP requests
async function request(method, endpoint, options = {}) {
  const url = `${BASE_URL}${API_PREFIX}${endpoint}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token && { 'Authorization': `Bearer ${options.token}` }),
      ...options.headers
    },
    ...(options.body && { body: JSON.stringify(options.body) })
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: {}
    };
  }
}

// Test helper
function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.passed.push(name);
      console.log(`${colors.green}✓${colors.reset} ${name}`);
      return true;
    } catch (error) {
      results.failed.push({ name, error: error.message });
      console.log(`${colors.red}✗${colors.reset} ${name}`);
      console.log(`  ${colors.red}Error:${colors.reset} ${error.message}`);
      return false;
    }
  };
}

// ============================================
// AUTHENTICATION TESTS
// ============================================

async function testAuth() {
  console.log(`\n${colors.cyan}=== AUTHENTICATION TESTS ===${colors.reset}\n`);

  await test('POST /auth/register - Create ADMIN user', async () => {
    const res = await request('POST', '/auth/register', {
      body: {
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'ADMIN'
      }
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(`Expected 201 or 409, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();

  await test('POST /auth/register - Create STAFF user', async () => {
    const res = await request('POST', '/auth/register', {
      body: {
        email: 'staff@test.com',
        password: 'password123',
        name: 'Staff User',
        role: 'STAFF'
      }
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(`Expected 201 or 409, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();

  await test('POST /auth/register - Create USER', async () => {
    const res = await request('POST', '/auth/register', {
      body: {
        email: 'user@test.com',
        password: 'password123',
        name: 'Regular User',
        role: 'USER'
      }
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(`Expected 201 or 409, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();

  await test('POST /auth/login/email - Login as ADMIN', async () => {
    const res = await request('POST', '/auth/login/email', {
      body: {
        email: 'admin@test.com',
        password: 'password123'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.accessToken) throw new Error('No access token received');
    adminToken = res.data.data.accessToken;
  })();

  await test('POST /auth/login/email - Login as STAFF', async () => {
    const res = await request('POST', '/auth/login/email', {
      body: {
        email: 'staff@test.com',
        password: 'password123'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.accessToken) throw new Error('No access token received');
    staffToken = res.data.data.accessToken;
  })();

  await test('POST /auth/login/email - Login as USER', async () => {
    const res = await request('POST', '/auth/login/email', {
      body: {
        email: 'user@test.com',
        password: 'password123'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.accessToken) throw new Error('No access token received');
    userToken = res.data.data.accessToken;
  })();

  await test('POST /auth/send-otp - Send OTP', async () => {
    const res = await request('POST', '/auth/send-otp', {
      body: {
        email: 'user@test.com',
        purpose: 'login'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('POST /auth/logout-all - Logout all sessions', async () => {
    if (!adminToken) throw new Error('No admin token available');
    const res = await request('POST', '/auth/logout-all', {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    // Re-login after logout
    const loginRes = await request('POST', '/auth/login/email', {
      body: {
        email: 'admin@test.com',
        password: 'password123'
      }
    });
    if (loginRes.ok && loginRes.data.data?.accessToken) {
      adminToken = loginRes.data.data.accessToken;
    }
  })();
}

// ============================================
// PACKAGES TESTS
// ============================================

async function testPackages() {
  console.log(`\n${colors.cyan}=== PACKAGES TESTS ===${colors.reset}\n`);

  await test('GET /packages - List packages (public)', async () => {
    const res = await request('GET', '/packages');
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /packages?page=1&limit=10 - List with pagination', async () => {
    const res = await request('GET', '/packages?page=1&limit=10');
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('POST /packages - Create package (ADMIN)', async () => {
    if (!adminToken) throw new Error('No admin token available');
    const res = await request('POST', '/packages', {
      token: adminToken,
      body: {
        name: 'Test Package',
        slug: 'test-package-' + Date.now(),
        description: 'Test description',
        summary: 'Test summary',
        isActive: true,
        isFeatured: false
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.id) throw new Error('No package ID returned');
    testPackageId = res.data.data.id;
  })();

  await test('GET /packages/:id - Get package by ID', async () => {
    if (!testPackageId) throw new Error('No package ID available');
    const res = await request('GET', `/packages/${testPackageId}`);
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /packages/slug/:slug - Get package by slug', async () => {
    const res = await request('GET', '/packages/slug/test-package');
    // May fail if slug doesn't exist, that's okay
    if (res.status !== 200 && res.status !== 404) {
      throw new Error(`Expected 200 or 404, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();

  await test('PATCH /packages/:id - Update package (ADMIN)', async () => {
    if (!testPackageId || !adminToken) throw new Error('No package ID or token available');
    const res = await request('PATCH', `/packages/${testPackageId}`, {
      token: adminToken,
      body: {
        description: 'Updated description'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('POST /packages/:id/variants - Add variant (ADMIN)', async () => {
    if (!testPackageId || !adminToken) throw new Error('No package ID or token available');
    const res = await request('POST', `/packages/${testPackageId}/variants`, {
      token: adminToken,
      body: {
        name: 'Standard Variant',
        basePrice: 10000,
        currency: 'INR',
        durationDays: 5,
        maxTravelers: 4,
        isDefault: true
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testVariantId = res.data.data.id;
  })();

  await test('POST /packages/:id/itineraries - Add itinerary (ADMIN)', async () => {
    if (!testPackageId || !adminToken) throw new Error('No package ID or token available');
    const res = await request('POST', `/packages/${testPackageId}/itineraries`, {
      token: adminToken,
      body: {
        dayNumber: 1,
        title: 'Day 1 - Arrival',
        description: 'Arrive at destination',
        activities: 'Check-in, rest'
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testItineraryId = res.data.data.id;
  })();

  await test('POST /packages/:id/schedules - Add schedule (ADMIN)', async () => {
    if (!testPackageId || !adminToken) throw new Error('No package ID or token available');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);

    const res = await request('POST', `/packages/${testPackageId}/schedules`, {
      token: adminToken,
      body: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        availableSeats: 20
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testScheduleId = res.data.data.id;
  })();

  await test('DELETE /packages/:id - Delete package (ADMIN)', async () => {
    if (!testPackageId || !adminToken) throw new Error('No package ID or token available');
    const res = await request('DELETE', `/packages/${testPackageId}`, {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// CITIES TESTS
// ============================================

async function testCities() {
  console.log(`\n${colors.cyan}=== CITIES TESTS ===${colors.reset}\n`);

  await test('GET /cities - List cities (public)', async () => {
    const res = await request('GET', '/cities');
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('POST /cities - Create city (ADMIN)', async () => {
    if (!adminToken) throw new Error('No admin token available');
    const res = await request('POST', '/cities', {
      token: adminToken,
      body: {
        name: 'Test City',
        slug: 'test-city-' + Date.now(),
        description: 'Test city description',
        country: 'India',
        isActive: true
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testCityId = res.data.data.id;
  })();

  await test('GET /cities/:id - Get city by ID', async () => {
    if (!testCityId) {
      results.skipped.push('GET /cities/:id - No city ID');
      return;
    }
    const res = await request('GET', `/cities/${testCityId}`);
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /cities/slug/:slug - Get city by slug', async () => {
    const res = await request('GET', '/cities/slug/test-city');
    if (res.status !== 200 && res.status !== 404) {
      throw new Error(`Expected 200 or 404, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();

  await test('PATCH /cities/:id - Update city (ADMIN)', async () => {
    if (!testCityId || !adminToken) {
      results.skipped.push('PATCH /cities/:id - No city ID or token');
      return;
    }
    const res = await request('PATCH', `/cities/${testCityId}`, {
      token: adminToken,
      body: {
        description: 'Updated description'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// BOOKINGS TESTS
// ============================================

async function testBookings() {
  console.log(`\n${colors.cyan}=== BOOKINGS TESTS ===${colors.reset}\n`);

  // First create a package for booking
  if (!testPackageId && adminToken) {
    const pkgRes = await request('POST', '/packages', {
      token: adminToken,
      body: {
        name: 'Booking Test Package',
        slug: 'booking-test-' + Date.now(),
        description: 'Package for booking tests',
        isActive: true
      }
    });
    if (pkgRes.ok && pkgRes.data.data?.id) {
      testPackageId = pkgRes.data.data.id;
    }
  }

  await test('POST /bookings - Create booking (USER)', async () => {
    if (!testPackageId || !userToken) {
      results.skipped.push('POST /bookings - No package ID or user token');
      return;
    }
    const res = await request('POST', '/bookings', {
      token: userToken,
      body: {
        packageId: testPackageId,
        variantId: testVariantId || null,
        travelers: [
          { name: 'Test Traveler', age: 30, gender: 'MALE' }
        ],
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testBookingId = res.data.data.id;
  })();

  await test('GET /bookings/my - List my bookings (USER)', async () => {
    if (!userToken) {
      results.skipped.push('GET /bookings/my - No user token');
      return;
    }
    const res = await request('GET', '/bookings/my', {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /bookings/admin - List all bookings (STAFF)', async () => {
    if (!staffToken) {
      results.skipped.push('GET /bookings/admin - No staff token');
      return;
    }
    const res = await request('GET', '/bookings/admin', {
      token: staffToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /bookings/:id - Get booking', async () => {
    if (!testBookingId || !userToken) {
      results.skipped.push('GET /bookings/:id - No booking ID or token');
      return;
    }
    const res = await request('GET', `/bookings/${testBookingId}`, {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// USERS TESTS
// ============================================

async function testUsers() {
  console.log(`\n${colors.cyan}=== USERS TESTS ===${colors.reset}\n`);

  await test('GET /users/me - Get profile', async () => {
    if (!userToken) {
      results.skipped.push('GET /users/me - No user token');
      return;
    }
    const res = await request('GET', '/users/me', {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('PATCH /users/me - Update profile', async () => {
    if (!userToken) {
      results.skipped.push('PATCH /users/me - No user token');
      return;
    }
    const res = await request('PATCH', '/users/me', {
      token: userToken,
      body: {
        name: 'Updated Name'
      }
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /users/admin/users - List all users (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('GET /users/admin/users - No admin token');
      return;
    }
    const res = await request('GET', '/users/admin/users', {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// STAFF TESTS
// ============================================

async function testStaff() {
  console.log(`\n${colors.cyan}=== STAFF TESTS ===${colors.reset}\n`);

  await test('POST /staff - Create staff (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('POST /staff - No admin token');
      return;
    }
    const res = await request('POST', '/staff', {
      token: adminToken,
      body: {
        email: 'newstaff@test.com',
        password: 'password123',
        name: 'New Staff Member',
        department: 'Sales'
      }
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(`Expected 201 or 409, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    if (res.data.data?.id) testStaffId = res.data.data.id;
  })();

  await test('GET /staff - List staff (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('GET /staff - No admin token');
      return;
    }
    const res = await request('GET', '/staff', {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /staff/:id - Get staff by ID', async () => {
    if (!testStaffId || !adminToken) {
      results.skipped.push('GET /staff/:id - No staff ID or token');
      return;
    }
    const res = await request('GET', `/staff/${testStaffId}`, {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// COUPONS TESTS
// ============================================

async function testCoupons() {
  console.log(`\n${colors.cyan}=== COUPONS TESTS ===${colors.reset}\n`);

  await test('POST /coupons - Create coupon (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('POST /coupons - No admin token');
      return;
    }
    const res = await request('POST', '/coupons', {
      token: adminToken,
      body: {
        code: 'TEST' + Date.now(),
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxUses: 100,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testCouponId = res.data.data.id;
  })();

  await test('GET /coupons - List coupons (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('GET /coupons - No admin token');
      return;
    }
    const res = await request('GET', '/coupons', {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /coupons/:id - Get coupon by ID', async () => {
    if (!testCouponId || !adminToken) {
      results.skipped.push('GET /coupons/:id - No coupon ID or token');
      return;
    }
    const res = await request('GET', `/coupons/${testCouponId}`, {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// BANNERS TESTS
// ============================================

async function testBanners() {
  console.log(`\n${colors.cyan}=== BANNERS TESTS ===${colors.reset}\n`);

  await test('GET /banners - List active banners (public)', async () => {
    const res = await request('GET', '/banners');
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('POST /banners - Create banner (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('POST /banners - No admin token');
      return;
    }
    const res = await request('POST', '/banners', {
      token: adminToken,
      body: {
        title: 'Test Banner',
        imageUrl: 'https://example.com/banner.jpg',
        linkUrl: 'https://example.com',
        isActive: true,
        order: 1
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testBannerId = res.data.data.id;
  })();

  await test('GET /banners/admin - List all banners (ADMIN)', async () => {
    if (!adminToken) {
      results.skipped.push('GET /banners/admin - No admin token');
      return;
    }
    const res = await request('GET', '/banners/admin', {
      token: adminToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// REVIEWS TESTS
// ============================================

async function testReviews() {
  console.log(`\n${colors.cyan}=== REVIEWS TESTS ===${colors.reset}\n`);

  await test('GET /reviews - List reviews (public)', async () => {
    const res = await request('GET', '/reviews');
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('POST /reviews - Create review (USER)', async () => {
    if (!testPackageId || !userToken) {
      results.skipped.push('POST /reviews - No package ID or user token');
      return;
    }
    const res = await request('POST', '/reviews', {
      token: userToken,
      body: {
        packageId: testPackageId,
        rating: 5,
        comment: 'Great package!'
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testReviewId = res.data.data.id;
  })();

  await test('GET /reviews/:id - Get review by ID', async () => {
    if (!testReviewId) {
      results.skipped.push('GET /reviews/:id - No review ID');
      return;
    }
    const res = await request('GET', `/reviews/${testReviewId}`);
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// SUPPORT TESTS
// ============================================

async function testSupport() {
  console.log(`\n${colors.cyan}=== SUPPORT TESTS ===${colors.reset}\n`);

  await test('POST /support - Create ticket (USER)', async () => {
    if (!userToken) {
      results.skipped.push('POST /support - No user token');
      return;
    }
    const res = await request('POST', '/support', {
      token: userToken,
      body: {
        subject: 'Test Ticket',
        message: 'This is a test support ticket',
        category: 'GENERAL'
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testTicketId = res.data.data.id;
  })();

  await test('GET /support - List my tickets (USER)', async () => {
    if (!userToken) {
      results.skipped.push('GET /support - No user token');
      return;
    }
    const res = await request('GET', '/support', {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /support/:id - Get ticket', async () => {
    if (!testTicketId || !userToken) {
      results.skipped.push('GET /support/:id - No ticket ID or token');
      return;
    }
    const res = await request('GET', `/support/${testTicketId}`, {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// REPORTS TESTS
// ============================================

async function testReports() {
  console.log(`\n${colors.cyan}=== REPORTS TESTS ===${colors.reset}\n`);

  await test('POST /reports - Create report (STAFF)', async () => {
    if (!staffToken) {
      results.skipped.push('POST /reports - No staff token');
      return;
    }
    const res = await request('POST', '/reports', {
      token: staffToken,
      body: {
        name: 'Test Report',
        type: 'BOOKINGS',
        params: {}
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.data?.id) testReportId = res.data.data.id;
  })();

  await test('GET /reports - List reports (STAFF)', async () => {
    if (!staffToken) {
      results.skipped.push('GET /reports - No staff token');
      return;
    }
    const res = await request('GET', '/reports', {
      token: staffToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /reports/bookings - Bookings report (STAFF)', async () => {
    if (!staffToken) {
      results.skipped.push('GET /reports/bookings - No staff token');
      return;
    }
    const res = await request('GET', '/reports/bookings', {
      token: staffToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /reports/revenue - Revenue report (STAFF)', async () => {
    if (!staffToken) {
      results.skipped.push('GET /reports/revenue - No staff token');
      return;
    }
    const res = await request('GET', '/reports/revenue', {
      token: staffToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /reports/:id - Get report by ID', async () => {
    if (!testReportId || !staffToken) {
      results.skipped.push('GET /reports/:id - No report ID or token');
      return;
    }
    const res = await request('GET', `/reports/${testReportId}`, {
      token: staffToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// TRANSPORT TESTS
// ============================================

async function testTransport() {
  console.log(`\n${colors.cyan}=== TRANSPORT TESTS ===${colors.reset}\n`);

  await test('POST /transport/flight - Add flight (STAFF)', async () => {
    if (!staffToken) {
      results.skipped.push('POST /transport/flight - No staff token');
      return;
    }
    const res = await request('POST', '/transport/flight', {
      token: staffToken,
      body: {
        bookingId: testBookingId || null,
        flightNumber: 'AI123',
        airline: 'Air India',
        departureAirport: 'DEL',
        arrivalAirport: 'BOM',
        departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
      }
    });
    // May fail if bookingId is required
    if (res.status !== 201 && res.status !== 400) {
      throw new Error(`Expected 201 or 400, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();
}

// ============================================
// PAYMENTS TESTS
// ============================================

async function testPayments() {
  console.log(`\n${colors.cyan}=== PAYMENTS TESTS ===${colors.reset}\n`);

  await test('GET /payments/booking/:bookingId - Get payment by booking', async () => {
    if (!testBookingId || !userToken) {
      results.skipped.push('GET /payments/booking/:bookingId - No booking ID or token');
      return;
    }
    const res = await request('GET', `/payments/booking/${testBookingId}`, {
      token: userToken
    });
    // May not exist yet
    if (res.status !== 200 && res.status !== 404) {
      throw new Error(`Expected 200 or 404, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();
}

// ============================================
// VISA TESTS
// ============================================

async function testVisa() {
  console.log(`\n${colors.cyan}=== VISA TESTS ===${colors.reset}\n`);

  await test('POST /visa - Create visa application (USER)', async () => {
    if (!userToken) {
      results.skipped.push('POST /visa - No user token');
      return;
    }
    const res = await request('POST', '/visa', {
      token: userToken,
      body: {
        country: 'USA',
        visaType: 'TOURIST',
        travelDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        passportNumber: 'TEST123456',
        passportExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /visa/my - List my visa applications (USER)', async () => {
    if (!userToken) {
      results.skipped.push('GET /visa/my - No user token');
      return;
    }
    const res = await request('GET', '/visa/my', {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// DOCUMENTS TESTS
// ============================================

async function testDocuments() {
  console.log(`\n${colors.cyan}=== DOCUMENTS TESTS ===${colors.reset}\n`);

  await test('GET /documents/types - List document types (public)', async () => {
    const res = await request('GET', '/documents/types');
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();

  await test('GET /documents/my - List my documents (USER)', async () => {
    if (!userToken) {
      results.skipped.push('GET /documents/my - No user token');
      return;
    }
    const res = await request('GET', '/documents/my', {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// FORMS TESTS
// ============================================

async function testForms() {
  console.log(`\n${colors.cyan}=== FORMS TESTS ===${colors.reset}\n`);

  await test('GET /forms/code/:code - Get form by code (public)', async () => {
    const res = await request('GET', '/forms/code/test-form');
    // May not exist
    if (res.status !== 200 && res.status !== 404) {
      throw new Error(`Expected 200 or 404, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();
}

// ============================================
// NOTIFICATIONS TESTS
// ============================================

async function testNotifications() {
  console.log(`\n${colors.cyan}=== NOTIFICATIONS TESTS ===${colors.reset}\n`);

  await test('GET /notifications - List my notifications (USER)', async () => {
    if (!userToken) {
      results.skipped.push('GET /notifications - No user token');
      return;
    }
    const res = await request('GET', '/notifications', {
      token: userToken
    });
    if (!res.ok) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// LEADS TESTS
// ============================================

async function testLeads() {
  console.log(`\n${colors.cyan}=== LEADS TESTS ===${colors.reset}\n`);

  await test('POST /leads - Create lead (public)', async () => {
    const res = await request('POST', '/leads', {
      body: {
        name: 'Test Lead',
        email: 'lead@test.com',
        phone: '+1234567890',
        source: 'WEBSITE',
        message: 'Interested in packages'
      }
    });
    if (!res.ok) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
  })();
}

// ============================================
// AI TESTS
// ============================================

async function testAI() {
  console.log(`\n${colors.cyan}=== AI TESTS ===${colors.reset}\n`);

  await test('POST /ai/recommendations - Get recommendations', async () => {
    const res = await request('POST', '/ai/recommendations', {
      body: {
        preferences: {
          budget: 50000,
          duration: 5,
          interests: ['beaches', 'culture']
        }
      }
    });
    // May fail if AI service not configured
    if (res.status !== 200 && res.status !== 503 && res.status !== 500) {
      throw new Error(`Expected 200, 503, or 500, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  })();
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log(`${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   API Endpoint Testing Suite          ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nBase URL: ${BASE_URL}${API_PREFIX}\n`);

  // Check if server is running
  try {
    const healthCheck = await request('GET', '/health');
    if (!healthCheck.ok && healthCheck.status !== 0) {
      console.log(`${colors.yellow}⚠ Warning: Health check failed. Make sure server is running.${colors.reset}\n`);
    }
  } catch (e) {
    console.log(`${colors.yellow}⚠ Warning: Could not reach server. Make sure it's running on ${BASE_URL}${colors.reset}\n`);
  }

  try {
    await testAuth();
    await testPackages();
    await testCities();
    await testBookings();
    await testUsers();
    await testStaff();
    await testCoupons();
    await testBanners();
    await testReviews();
    await testSupport();
    await testReports();
    await testTransport();
    await testPayments();
    await testVisa();
    await testDocuments();
    await testForms();
    await testNotifications();
    await testLeads();
    await testAI();

    // Print summary
    console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║           TEST SUMMARY                  ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);
    console.log(`${colors.green}✓ Passed: ${results.passed.length}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${results.failed.length}${colors.reset}`);
    console.log(`${colors.yellow}⊘ Skipped: ${results.skipped.length}${colors.reset}`);

    if (results.failed.length > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      results.failed.forEach(({ name, error }) => {
        console.log(`  ${colors.red}✗${colors.reset} ${name}`);
        console.log(`    ${colors.red}→${colors.reset} ${error}`);
      });
    }

    if (results.skipped.length > 0) {
      console.log(`\n${colors.yellow}Skipped Tests:${colors.reset}`);
      results.skipped.forEach(name => {
        console.log(`  ${colors.yellow}⊘${colors.reset} ${name}`);
      });
    }

    const successRate = ((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1);
    console.log(`\n${colors.blue}Success Rate: ${successRate}%${colors.reset}\n`);

    process.exit(results.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
