# API Testing Setup Guide

## ✅ Database Configuration Complete

Your Supabase PostgreSQL database has been configured:
- **Database URL**: Configured in `.env` file
- **Password**: URL encoded (RitamTitan@007 → RitamTitan%40007)
- **SSL Mode**: Required (Supabase requirement)

## 📋 Next Steps

### 1. Run Database Migrations

From your local machine (with network access to Supabase):

```bash
cd /Users/ritambiswas/flight
npm run prisma:migrate:deploy
```

This will create all necessary tables in your Supabase database.

### 2. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Run API Tests

Once the server is running, execute the comprehensive test suite:

```bash
node test-all-apis.js
```

Or if you prefer:

```bash
./test-all-apis.js
```

## 🔐 Test Credentials

The test script will automatically create these test users:

- **ADMIN**: `admin@test.com` / `password123`
- **STAFF**: `staff@test.com` / `password123`
- **USER**: `user@test.com` / `password123`

## 📊 Test Coverage

The test script covers all API endpoints:

### Authentication (8 tests)
- User registration (ADMIN, STAFF, USER)
- Email login
- OTP sending
- Logout

### Packages (9 tests)
- List packages (public)
- Create package (ADMIN)
- Get by ID/slug
- Update package
- Add variants, itineraries, schedules
- Delete package

### Cities (5 tests)
- List cities (public)
- Create/update city (ADMIN)
- Get by ID/slug

### Bookings (4 tests)
- Create booking (USER)
- List my bookings
- List all bookings (STAFF)
- Get booking details

### Users (3 tests)
- Get/update profile
- List all users (ADMIN)

### Staff (3 tests)
- Create staff (ADMIN)
- List staff
- Get staff by ID

### Coupons (3 tests)
- Create/list/get coupons (ADMIN)

### Banners (3 tests)
- List active banners (public)
- Create/list all banners (ADMIN)

### Reviews (3 tests)
- List reviews (public)
- Create/get review (USER)

### Support (3 tests)
- Create ticket (USER)
- List/get tickets

### Reports (5 tests)
- Create/list reports (STAFF)
- Bookings/revenue reports

### Transport, Payments, Visa, Documents, Forms, Notifications, Leads, AI
- Additional endpoint tests

## 🔧 Environment Variables

All required environment variables are configured in `.env`:

- ✅ Database connection (Supabase)
- ✅ JWT secrets (secure random keys)
- ⏳ Firebase (to be configured)
- ⏳ Payment providers (optional)
- ⏳ Other optional services

## 🚨 Troubleshooting

### Database Connection Issues

If migrations fail, check:
1. Supabase database is accessible from your network
2. Password is correctly URL encoded (`@` → `%40`)
3. SSL mode is enabled (already configured)

### Server Won't Start

Check:
1. Port 3000 is not already in use
2. `.env` file exists and is properly formatted
3. All dependencies are installed: `npm install`

### Tests Fail

Common issues:
1. Server not running - start with `npm run dev`
2. Database not migrated - run `npm run prisma:migrate:deploy`
3. Network connectivity to Supabase

## 📝 Notes

- The test script uses Node.js built-in `fetch` (Node 18+)
- Tests are designed to be idempotent (can run multiple times)
- Failed tests will show detailed error messages
- Skipped tests indicate missing prerequisites (tokens, IDs, etc.)

## 🔄 After Firebase Configuration

Once you provide Firebase credentials, update `.env`:

```env
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

Then restart the server and re-run tests.
