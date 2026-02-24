# User Portal (Next.js)

**User** + **common** endpoints for the Travel & Pilgrimage API. For **admin** + common endpoints, use **admin-app** (React).

## Setup

```bash
cp .env.example .env
# .env: NEXT_PUBLIC_API_URL=http://localhost:3001 (backend). User-app runs on http://localhost:3002
npm install
npm run dev
```
Then open **http://localhost:3002**

## Features

- **Common:** Home (list packages), package detail by ID/slug, cities, banners, reviews, document types, forms (get by code, submit), create lead.
- **Auth:** Register, Login, Forgot password (API ready).
- **User:** Profile (get/update), My bookings (list, detail), Create booking, Payments (create order, get by booking), Support (create ticket, list my, get, reply), Visa (create, list my, get, update, submit), Reviews (create, update), Documents (list my, get), Notifications (list my, mark read).

API base: `NEXT_PUBLIC_API_URL` + `/api/v1`.
