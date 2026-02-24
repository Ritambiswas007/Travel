# Travel & Pilgrimage – User app handover

## What’s included

- **Figma-style UI**: Header (logo, Stays / Experiences / Online Experiences, search bar, user menu), category filters, package cards grid (image, “Guest favourite” tag, heart to save, location, price, rating), “Show map” button, footer.
- **APIs wired**:
  - **Packages**: List with filters (search, featured, city, active), package by ID/slug. Response uses `items` and `total`.
  - **Auth**: Register, login (with redirect), logout.
  - **User**: Profile (get/update), my bookings.
  - **Book**: Reserve flow entry; sign-in redirects back to book page.

## Run for development

1. Backend: from repo root, `npm run dev` (default port 3001 if 3000 is busy).
2. User app: `cd user-app`, then `npm install` and `npm run dev`. App runs at **http://localhost:3002**.
3. Set `.env`: `NEXT_PUBLIC_API_URL=http://localhost:3001` (or your deployed API URL).

## Deploy (e.g. Vercel)

- Build: `npm run build`.
- Env: set `NEXT_PUBLIC_API_URL` to your production API (e.g. Render).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home – package grid, category filters, search/filter via URL |
| `/packages/[id]` | Package detail – image, description, itinerary, Reserve CTA |
| `/book?packageId=...` | Booking entry – sign in or complete booking |
| `/login`, `/register` | Auth (login supports `?redirect=...`) |
| `/profile` | My profile (requires login) |
| `/bookings` | My bookings (requires login) |
| `/experiences`, `/online`, `/host` | Placeholder pages |

## Favorites

- Heart on each card saves to **localStorage** (key `travel_favorites`). No backend endpoint used.

## Backend expectations

- `GET /api/v1/packages` query params: `page`, `limit`, `search`, `isFeatured`, `cityId`, `isActive`. Response: `{ success: true, data: { items, total } }`.
- Each package item can include `city`, `variants` (for price). Optional `imageUrl`, `isFeatured` for card UI.
