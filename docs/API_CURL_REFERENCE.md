# Travel & Pilgrimage API — cURL Reference

Base URL: `http://localhost:3000`  
API prefix: `/api/v1`  
All endpoints below use `BASE=http://localhost:3000/api/v1`. For authenticated requests, set `TOKEN` to your JWT access token.

---

## Health

```bash
curl -s -X GET "http://localhost:3000/health"
```

---

## Auth

### Register
```bash
curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "USER"
  }'
```
**Body:** `name` (required), `email` or `phone`, `password`, `role` (optional: USER | STAFF | ADMIN)

### Login (email)
```bash
curl -s -X POST "$BASE/auth/login/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePassword123"}'
```

### Login (phone)
```bash
curl -s -X POST "$BASE/auth/login/phone" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"123456"}'
```

### Send OTP
```bash
curl -s -X POST "$BASE/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","purpose":"login"}'
```
**Body:** `email` or `phone`, `purpose`: login | register | forgot_password | verify

### Refresh token
```bash
curl -s -X POST "$BASE/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### Logout
```bash
curl -s -X POST "$BASE/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### Forgot password
```bash
curl -s -X POST "$BASE/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Reset password
```bash
curl -s -X POST "$BASE/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"RESET_TOKEN_FROM_EMAIL","newPassword":"newSecurePassword123"}'
```

### Logout all (revoke all sessions)
```bash
curl -s -X POST "$BASE/auth/logout-all" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Users

### Get my profile
```bash
curl -s -X GET "$BASE/users/me" -H "Authorization: Bearer $TOKEN"
```

### Update my profile
```bash
curl -s -X PATCH "$BASE/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### List all users (ADMIN)
```bash
curl -s -X GET "$BASE/users/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Packages

### List packages (public, cached)
```bash
curl -s -X GET "$BASE/packages?page=1&limit=10&cityId=UUID&isActive=true&isFeatured=false&search=keyword"
```

### Get package by slug (public, cached)
```bash
curl -s -X GET "$BASE/packages/slug/my-package-slug"
```

### Get package by ID (public, cached)
```bash
curl -s -X GET "$BASE/packages/PACKAGE_UUID"
```

### Create package (ADMIN)
```bash
curl -s -X POST "$BASE/packages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Himalayan Trek",
    "slug": "himalayan-trek",
    "description": "5-day trek",
    "summary": "Short summary",
    "imageUrl": "https://example.com/img.jpg",
    "cityId": "CITY_UUID",
    "isActive": true,
    "isFeatured": false,
    "metaTitle": "SEO title",
    "metaDesc": "SEO description"
  }'
```

### Update package (ADMIN)
```bash
curl -s -X PATCH "$BASE/packages/PACKAGE_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description","isActive":true}'
```

### Delete package (ADMIN)
```bash
curl -s -X DELETE "$BASE/packages/PACKAGE_UUID" -H "Authorization: Bearer $TOKEN"
```

### Add variant (ADMIN)
```bash
curl -s -X POST "$BASE/packages/PACKAGE_UUID/variants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Standard",
    "description": "Standard package",
    "basePrice": 10000,
    "currency": "INR",
    "durationDays": 5,
    "maxTravelers": 4,
    "isDefault": true
  }'
```

### Add itinerary (ADMIN)
```bash
curl -s -X POST "$BASE/packages/PACKAGE_UUID/itineraries" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayNumber": 1,
    "title": "Day 1 - Arrival",
    "description": "Arrive at base",
    "activities": "Check-in, briefing"
  }'
```

### Add schedule (ADMIN)
```bash
curl -s -X POST "$BASE/packages/PACKAGE_UUID/schedules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-06-01",
    "endDate": "2025-06-05",
    "availableSeats": 20
  }'
```

---

## Cities

### List cities (public, cached)
```bash
curl -s -X GET "$BASE/cities?page=1&limit=20&isActive=true"
```

### Get city by slug (public, cached)
```bash
curl -s -X GET "$BASE/cities/slug/delhi"
```

### Get city by ID (public, cached)
```bash
curl -s -X GET "$BASE/cities/CITY_UUID"
```

### Create city (ADMIN)
```bash
curl -s -X POST "$BASE/cities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delhi",
    "slug": "delhi",
    "country": "India",
    "description": "Capital city",
    "imageUrl": "https://example.com/delhi.jpg",
    "sortOrder": 1
  }'
```

### Update city (ADMIN)
```bash
curl -s -X PATCH "$BASE/cities/CITY_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated","isActive":true}'
```

### Delete city (ADMIN)
```bash
curl -s -X DELETE "$BASE/cities/CITY_UUID" -H "Authorization: Bearer $TOKEN"
```

---

## Staff

### Create staff (ADMIN)
```bash
curl -s -X POST "$BASE/staff" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "password123",
    "name": "Jane Staff",
    "department": "Sales"
  }'
```

### List staff (ADMIN)
```bash
curl -s -X GET "$BASE/staff?page=1&limit=20&isActive=true&search=name" \
  -H "Authorization: Bearer $TOKEN"
```

### Get staff by ID (ADMIN)
```bash
curl -s -X GET "$BASE/staff/STAFF_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update staff (ADMIN)
```bash
curl -s -X PATCH "$BASE/staff/STAFF_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","department":"Support","isActive":true}'
```

---

## Coupons

### Create coupon (ADMIN)
```bash
curl -s -X POST "$BASE/coupons" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE10",
    "description": "10% off",
    "discountType": "PERCENT",
    "discountValue": 10,
    "minOrderAmount": 5000,
    "maxDiscount": 2000,
    "usageLimit": 100,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validTo": "2025-12-31T23:59:59.000Z"
  }'
```
**discountType:** PERCENT | FIXED

### List coupons (ADMIN)
```bash
curl -s -X GET "$BASE/coupons?page=1&limit=20" -H "Authorization: Bearer $TOKEN"
```

### Get coupon by ID (ADMIN)
```bash
curl -s -X GET "$BASE/coupons/COUPON_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update coupon (ADMIN)
```bash
curl -s -X PATCH "$BASE/coupons/COUPON_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"discountValue":15,"isActive":true}'
```

---

## Banners

### List active banners (public, cached)
```bash
curl -s -X GET "$BASE/banners?position=home"
```

### Create banner (ADMIN)
```bash
curl -s -X POST "$BASE/banners" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale",
    "imageUrl": "https://example.com/banner.jpg",
    "linkUrl": "https://example.com/offers",
    "position": "home",
    "sortOrder": 1,
    "startAt": "2025-06-01T00:00:00.000Z",
    "endAt": "2025-08-31T23:59:59.000Z"
  }'
```

### List all banners (ADMIN, cached)
```bash
curl -s -X GET "$BASE/banners/admin?page=1&limit=20" -H "Authorization: Bearer $TOKEN"
```

### Get banner by ID (ADMIN)
```bash
curl -s -X GET "$BASE/banners/BANNER_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update banner (ADMIN)
```bash
curl -s -X PATCH "$BASE/banners/BANNER_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Title","isActive":true}'
```

### Delete banner (ADMIN)
```bash
curl -s -X DELETE "$BASE/banners/BANNER_UUID" -H "Authorization: Bearer $TOKEN"
```

---

## Reviews

### List reviews (public, cached)
```bash
curl -s -X GET "$BASE/reviews?page=1&limit=20&packageId=PACKAGE_UUID&rating=5"
```

### Create review (USER)
```bash
curl -s -X POST "$BASE/reviews" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PACKAGE_UUID",
    "rating": 5,
    "title": "Amazing trip",
    "comment": "Highly recommend."
  }'
```

### Get review by ID (cached)
```bash
curl -s -X GET "$BASE/reviews/REVIEW_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update review (USER)
```bash
curl -s -X PATCH "$BASE/reviews/REVIEW_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":4,"comment":"Updated comment","isPublic":true}'
```

---

## Support

### Create ticket (USER)
```bash
curl -s -X POST "$BASE/support" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Booking change request",
    "message": "I need to change my travel dates.",
    "priority": "high"
  }'
```

### List my tickets (USER)
```bash
curl -s -X GET "$BASE/support?page=1&limit=20" -H "Authorization: Bearer $TOKEN"
```

### Get ticket (USER)
```bash
curl -s -X GET "$BASE/support/TICKET_UUID" -H "Authorization: Bearer $TOKEN"
```

### Reply to ticket
```bash
curl -s -X POST "$BASE/support/TICKET_UUID/reply" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"We will process your request.","isStaff":false}'
```

### Close ticket
```bash
curl -s -X POST "$BASE/support/TICKET_UUID/close" -H "Authorization: Bearer $TOKEN"
```

---

## Reports

### Create report (STAFF)
```bash
curl -s -X POST "$BASE/reports" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly bookings",
    "type": "bookings",
    "params": {"month": "2025-01"}
  }'
```

### List reports (STAFF)
```bash
curl -s -X GET "$BASE/reports?page=1&limit=20&type=bookings" \
  -H "Authorization: Bearer $TOKEN"
```

### Bookings report (STAFF)
```bash
curl -s -X GET "$BASE/reports/bookings?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Revenue report (STAFF)
```bash
curl -s -X GET "$BASE/reports/revenue?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Get report by ID (STAFF)
```bash
curl -s -X GET "$BASE/reports/REPORT_UUID" -H "Authorization: Bearer $TOKEN"
```

---

## Bookings

### Create booking (USER)
```bash
curl -s -X POST "$BASE/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "PACKAGE_UUID",
    "packageScheduleId": "SCHEDULE_UUID",
    "packageVariantId": "VARIANT_UUID",
    "travelers": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+919876543210",
        "dateOfBirth": "1990-01-15",
        "passportNo": "A12345678",
        "passportExpiry": "2030-12-31",
        "seatPreference": "window"
      }
    ],
    "addons": [],
    "couponCode": "SAVE10",
    "specialRequests": "Vegetarian meals"
  }'
```

### List my bookings (USER)
```bash
curl -s -X GET "$BASE/bookings/my?page=1&limit=20&status=CONFIRMED" \
  -H "Authorization: Bearer $TOKEN"
```

### List all bookings (STAFF)
```bash
curl -s -X GET "$BASE/bookings/admin?page=1&limit=20&status=PENDING&userId=USER_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

### Get booking (USER/STAFF)
```bash
curl -s -X GET "$BASE/bookings/BOOKING_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update booking step (USER/STAFF)
```bash
curl -s -X PATCH "$BASE/bookings/BOOKING_UUID/step" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "step": 2,
    "travelers": [{"firstName":"John","lastName":"Doe"}],
    "specialRequests": "None"
  }'
```

### Apply coupon to booking (USER)
```bash
curl -s -X POST "$BASE/bookings/BOOKING_UUID/apply-coupon" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"couponCode":"SAVE10"}'
```

### Confirm booking (USER/STAFF)
```bash
curl -s -X POST "$BASE/bookings/BOOKING_UUID/confirm" \
  -H "Authorization: Bearer $TOKEN"
```

### Cancel booking (USER/STAFF)
```bash
curl -s -X POST "$BASE/bookings/BOOKING_UUID/cancel" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Payments

### Create order (USER)
```bash
curl -s -X POST "$BASE/payments/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_UUID",
    "amount": 10000,
    "currency": "INR",
    "idempotencyKey": "unique-key-123"
  }'
```

### Get payment by booking (USER/STAFF)
```bash
curl -s -X GET "$BASE/payments/booking/BOOKING_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

### Get payment by ID (USER/STAFF)
```bash
curl -s -X GET "$BASE/payments/PAYMENT_UUID" -H "Authorization: Bearer $TOKEN"
```

### Initiate refund (STAFF)
```bash
curl -s -X POST "$BASE/payments/refunds" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"PAYMENT_UUID","amount":5000,"reason":"Customer request"}'
```

**Note:** Payment webhook is at `POST /api/v1/payments/webhook` (raw body, Razorpay signature verification).

---

## Transport

### Add flight (STAFF)
```bash
curl -s -X POST "$BASE/transport/flight" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_UUID",
    "airline": "IndiGo",
    "flightNumber": "6E-123",
    "departureCity": "DEL",
    "arrivalCity": "BOM",
    "departureAt": "2025-06-01T10:00:00.000Z",
    "arrivalAt": "2025-06-01T12:00:00.000Z",
    "seatNumber": "12A",
    "pnr": "ABC123"
  }'
```

### Add train (STAFF)
```bash
curl -s -X POST "$BASE/transport/train" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_UUID",
    "trainName": "Rajdhani",
    "trainNumber": "12345",
    "departureCity": "NDLS",
    "arrivalCity": "MUM",
    "departureAt": "2025-06-01T18:00:00.000Z",
    "arrivalAt": "2025-06-02T08:00:00.000Z",
    "coach": "A1",
    "seatNumber": "42",
    "pnr": "PNR456"
  }'
```

### Add bus (STAFF)
```bash
curl -s -X POST "$BASE/transport/bus" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_UUID",
    "busOperator": "Volvo",
    "departureCity": "Bangalore",
    "arrivalCity": "Mysore",
    "departureAt": "2025-06-01T09:00:00.000Z",
    "arrivalAt": "2025-06-01T12:00:00.000Z",
    "seatNumber": "15"
  }'
```

---

## Visa

### Create visa application (USER)
```bash
curl -s -X POST "$BASE/visa" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country":"USA","type":"TOURIST"}'
```

### List my visa applications (USER)
```bash
curl -s -X GET "$BASE/visa/my" -H "Authorization: Bearer $TOKEN"
```

### Get visa application (USER)
```bash
curl -s -X GET "$BASE/visa/VISA_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update visa application (USER)
```bash
curl -s -X PATCH "$BASE/visa/VISA_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country":"UK","type":"BUSINESS"}'
```

### Submit visa application (USER)
```bash
curl -s -X POST "$BASE/visa/VISA_UUID/submit" \
  -H "Authorization: Bearer $TOKEN"
```

### Add document to visa (USER)
```bash
curl -s -X POST "$BASE/visa/VISA_UUID/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"passport","fileUrl":"https://storage.example.com/passport.pdf","storagePath":"visa/USER_ID/file.pdf"}'
```

---

## Documents

### List document types (public, cached)
```bash
curl -s -X GET "$BASE/documents/types"
```

### List my documents (USER)
```bash
curl -s -X GET "$BASE/documents/my" -H "Authorization: Bearer $TOKEN"
```

### Upload document (USER)
```bash
curl -s -X POST "$BASE/documents/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentTypeId": "TYPE_UUID",
    "fileUrl": "https://storage.example.com/doc.pdf",
    "storagePath": "documents/user123/doc.pdf"
  }'
```

### Download checklist PDF (USER)
```bash
curl -s -X GET "$BASE/documents/checklist/pdf" -H "Authorization: Bearer $TOKEN"
```

### Get document (USER/STAFF)
```bash
curl -s -X GET "$BASE/documents/DOCUMENT_UUID" -H "Authorization: Bearer $TOKEN"
```

### Create document type (STAFF)
```bash
curl -s -X POST "$BASE/documents/types" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Passport",
    "code": "PASSPORT",
    "description": "Valid passport copy",
    "validationRules": {},
    "isRequired": true,
    "expiresInDays": 365
  }'
```

### Get document type (STAFF)
```bash
curl -s -X GET "$BASE/documents/types/TYPE_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update document status (STAFF)
```bash
curl -s -X PATCH "$BASE/documents/DOCUMENT_UUID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'
```
**status:** PENDING | APPROVED | REJECTED. Use `rejectedReason` when status is REJECTED.

---

## Forms

### Get form by code (public)
```bash
curl -s -X GET "$BASE/forms/code/VISA_APPLICATION"
```

### Submit form (public)
```bash
curl -s -X POST "$BASE/forms/FORM_UUID/submit" \
  -H "Content-Type: application/json" \
  -d '{"data":{"fullName":"John Doe","email":"john@example.com"}}'
```

### Create form (STAFF)
```bash
curl -s -X POST "$BASE/forms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Visa Application",
    "code": "VISA_APPLICATION",
    "description": "Visa form for travelers"
  }'
```

### List forms (STAFF)
```bash
curl -s -X GET "$BASE/forms?page=1&limit=20" -H "Authorization: Bearer $TOKEN"
```

### Get form by ID (STAFF)
```bash
curl -s -X GET "$BASE/forms/FORM_UUID" -H "Authorization: Bearer $TOKEN"
```

### Add field to form (STAFF)
```bash
curl -s -X POST "$BASE/forms/FORM_UUID/fields" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "email",
    "label": "Email",
    "type": "email",
    "required": true,
    "options": {},
    "sortOrder": 1
  }'
```

---

## Notifications

### List my notifications (USER)
```bash
curl -s -X GET "$BASE/notifications?page=1&limit=20&unreadOnly=true" \
  -H "Authorization: Bearer $TOKEN"
```

### Mark notification as read (USER)
```bash
curl -s -X POST "$BASE/notifications/mark-read/NOTIFICATION_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

### Send notification (STAFF)
```bash
curl -s -X POST "$BASE/notifications/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "title": "Booking confirmed",
    "body": "Your booking #123 is confirmed.",
    "type": "booking",
    "channel": "push",
    "data": {"bookingId": "BOOKING_UUID"}
  }'
```
**channel:** email | sms | push. Omit `userId` to send to all (broadcast).

---

## Leads

### Facebook webhook (GET for verification)
```bash
curl -s -X GET "$BASE/leads/webhook/facebook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=CHALLENGE"
```

### Create lead (public)
```bash
curl -s -X POST "$BASE/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lead@example.com",
    "phone": "+919876543210",
    "name": "Lead Name",
    "message": "Interested in pilgrimage package",
    "sourceId": "facebook_lead_123",
    "metadata": {"campaign": "summer"}
  }'
```

### List leads (STAFF)
```bash
curl -s -X GET "$BASE/leads?page=1&limit=20&status=NEW&sourceId=facebook" \
  -H "Authorization: Bearer $TOKEN"
```

### Get lead (STAFF)
```bash
curl -s -X GET "$BASE/leads/LEAD_UUID" -H "Authorization: Bearer $TOKEN"
```

### Update lead (STAFF)
```bash
curl -s -X PATCH "$BASE/leads/LEAD_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONTACTED","score":80,"convertedBookingId":"BOOKING_UUID"}'
```
**status:** NEW | CONTACTED | QUALIFIED | CONVERTED | LOST

### Assign lead (STAFF)
```bash
curl -s -X POST "$BASE/leads/LEAD_UUID/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"staffId":"STAFF_UUID"}'
```

---

## AI

### Get recommendations
```bash
curl -s -X POST "$BASE/ai/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_UUID","context":"family trip","limit":5}'
```

### Answer FAQ
```bash
curl -s -X POST "$BASE/ai/faq" \
  -H "Content-Type: application/json" \
  -d '{"question":"What documents are needed for visa?","context":"USA"}'
```

### Booking assistant
```bash
curl -s -X POST "$BASE/ai/booking-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query":"Suggest packages under 20k for 5 days","bookingId":"BOOKING_UUID","context":{}}'
```

---

## Summary

- **~100 endpoints** (including health, auth, users, staff, packages, cities, coupons, banners, reviews, support, reports, bookings, payments, transport, visa, documents, forms, notifications, leads, AI).
- **Cached GETs** (when Redis is configured): packages list/slug/id, cities list/slug/id, banners list/admin/id, reviews list/id, document types.
- **Auth:** Use `Authorization: Bearer <accessToken>` for protected routes. Obtain token via `POST /api/v1/auth/login/email` or register.
- **Roles:** USER, STAFF, ADMIN. Some routes require STAFF or ADMIN only.
