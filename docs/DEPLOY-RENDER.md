# Deploy Travel & Pilgrimage API to Render

This guide covers deploying the **backend API** (Node.js + Express + Prisma + PostgreSQL) to [Render](https://render.com).

> **Note:** The Flutter app is a mobile/client app; you run it on devices or emulators and point it at your deployed API URL. It is not deployed to Render.

---

## Option A: Deploy with Blueprint (recommended)

1. **Push your code to GitHub** (or GitLab/Bitbucket) and ensure the repo contains `render.yaml` at the root.

2. **Sign in to [Render](https://render.com)** and go to **Dashboard** → **Blueprints** → **New Blueprint Instance**.

3. **Connect your repository** and select the repo that contains this project. Render will detect `render.yaml` in the root.

4. **Apply the Blueprint.** Render will create:
   - A **PostgreSQL** database: `travel-pilgrimage-db`
   - A **Web Service**: `travel-pilgrimage-api` (Node, build + Prisma migrate + start)

5. **Environment variables** set by the Blueprint:
   - `DATABASE_URL` and `DIRECT_URL` – from the linked Postgres DB
   - `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` – auto-generated (stored in Render)
   - `NODE_ENV`, `API_PREFIX`, JWT expiry – as in `render.yaml`

6. After the first deploy, your API will be at:
   - **URL:** `https://<your-service-name>.onrender.com`
   - **API base:** `https://<your-service-name>.onrender.com/api/v1`

7. **Update the Flutter app** to use this base URL in `flutter_app/lib/core/config.dart`:
   - Set `baseUrl` to `https://<your-service-name>.onrender.com` (no trailing slash).

---

## Option B: Manual setup (without Blueprint)

1. **Create a PostgreSQL database**  
   Render Dashboard → **New** → **PostgreSQL**. Note the **Internal Database URL**.

2. **Create a Web Service**  
   **New** → **Web Service**, connect your repo, and set:
   - **Root Directory:** (leave blank if backend is repo root)
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Pre-deploy Command (optional but recommended):** `npx prisma migrate deploy`

3. **Environment variables** (Dashboard → your Web Service → **Environment**):

   | Key                 | Value / Source |
   |---------------------|----------------|
   | `NODE_ENV`          | `production`   |
   | `PORT`              | (set by Render automatically) |
   | `API_PREFIX`        | `api/v1` or `/api/v1` (match your app) |
   | `DATABASE_URL`      | Internal Database URL from step 1 |
   | `DIRECT_URL`        | Same as `DATABASE_URL` |
   | `JWT_ACCESS_SECRET` | Strong secret (e.g. `openssl rand -base64 32`) |
   | `JWT_REFRESH_SECRET`| Strong secret (different from access) |
   | `JWT_ACCESS_EXPIRY` | `15m` (optional) |
   | `JWT_REFRESH_EXPIRY`| `7d` (optional) |

4. Deploy. Your API will be at `https://<service-name>.onrender.com`.

---

## Required vs optional env vars

- **Required for minimal deploy:**  
  `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.  
  `PORT` is set by Render.

- **Optional** (see `.env.example`):  
  Redis, Supabase, Firebase, Razorpay/Cashfree, Facebook Leads, PDF service, AI hooks, email/SMS/push notifications. Add these in the Render **Environment** tab if you use those features.

---

## After deploy

- **Health:** Open `https://<your-service-name>.onrender.com/api/v1/...` (e.g. a public route if you have one). 401 on protected routes is expected without a token.
- **Flutter app:** Set `AppConfig.baseUrl` in `flutter_app/lib/core/config.dart` to `https://<your-service-name>.onrender.com` and rebuild the app.
- **Free tier:** The service may spin down after inactivity; first request can be slow (cold start).

---

## Troubleshooting

- **Build fails on Prisma:** Ensure **Build Command** includes `npx prisma generate` and that `DATABASE_URL` (and `DIRECT_URL` if used) are set before the build (they are when using the Blueprint or a linked DB).
- **Migrations:** Use **Pre-deploy Command** `npx prisma migrate deploy` so migrations run on each deploy.
- **CORS:** If the Flutter app or a web app gets CORS errors, ensure the backend allows your app’s origin (e.g. in Express CORS config).
