# Web Apps (React Admin + Next.js User)

The Travel & Pilgrimage API is consumed by two web frontends, split by audience and endpoints (see Postman collection).

## admin-app (React + Vite)

- **Audience:** Admin & Staff
- **Endpoints:** **Admin** + **Common**
- **Stack:** React 19, TypeScript, Vite, React Router
- **Auth:** Login only (email/password). Access restricted to `ADMIN` and `STAFF` roles.

| Area | Endpoints |
|------|-----------|
| Common | Health, Packages (list, get), Cities (list, get), Banners (list active), Reviews (list), Document types (list), Forms (get by code, submit), Leads (create) |
| Admin/Staff | Users (list), Packages (CRUD, variants, itineraries, schedules), Cities CRUD, Staff CRUD, Coupons CRUD, Banners CRUD, Bookings (list all, get, step, coupon, confirm, cancel), Payments (get, refund), Transport (flight, train, bus), Documents (types CRUD, update status), Forms (list, create, add field), Notifications (send), Leads (list, get, update, assign), Support (list, get, reply, close), Reports (list, bookings, revenue) |

**Run:** `cd admin-app && npm i && npm run dev`  
**Env:** `VITE_API_URL=http://localhost:3000` (or your Render API URL)

---

## user-app (Next.js)

- **Audience:** End users (customers)
- **Endpoints:** **User** + **Common**
- **Stack:** Next.js 15, TypeScript, App Router
- **Auth:** Register, Login (email/password). Token stored in `localStorage` (client).

| Area | Endpoints |
|------|-----------|
| Common | Same as above (packages, cities, banners, reviews, document types, forms, leads) |
| User | Profile (get, update), Bookings (create, list my, get, apply coupon, confirm, cancel), Payments (create order, get by booking/ID), Support (create ticket, list my, get, reply), Visa (create, list my, get, update, submit), Reviews (create, update), Documents (list my, get), Notifications (list my, mark read) |

**Run:** `cd user-app && npm i && npm run dev`  
**Env:** `NEXT_PUBLIC_API_URL=http://localhost:3000` (or your Render API URL)

---

## Reference

- **API collection:** `docs/Travel-Pilgrimage-API.postman_collection.json`
- **Backend:** Node.js + Express + Prisma (repo root)
- **Flutter:** Staff-only mobile app (`flutter_app/`)
