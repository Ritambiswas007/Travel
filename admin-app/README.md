# Admin Portal (React)

Admin + **common** endpoints for the Travel & Pilgrimage API. For **user** + common endpoints, use the **user-app** (Next.js).

## Setup

```bash
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000 (or your Render URL)
npm install
npm run dev
```

## Features

- **Login** (Admin/Staff only)
- **Dashboard** – API health, packages count, bookings count
- **Users** – List all users (ADMIN)
- **Packages** – List, view (common); Create/Update/Delete, variants, itineraries, schedules (ADMIN)
- **Cities** – List, CRUD (ADMIN)
- **Staff** – List, CRUD (ADMIN)
- **Coupons** – List, CRUD (ADMIN)
- **Banners** – List active (common), List all / CRUD (ADMIN)
- **Bookings** – List all, get, update step, confirm, cancel (STAFF)
- **Reports** – Bookings & revenue (STAFF)
- **Leads** – List, get, update, assign (STAFF)
- **Support** – List tickets, reply, close (STAFF)
- **Documents** – Types list (common), create type, update status (STAFF)
- **Forms** – Get by code, submit (common), list, create, add field (STAFF)
- **Notifications** – Send (STAFF)

API base: `VITE_API_URL` + `/api/v1`.
