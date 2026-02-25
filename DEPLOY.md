# Deploy Backend to Render

## Quick deploy (Blueprint)

1. **Push your repo to GitHub** (ensure `render.yaml` and `prisma/migrations/` are committed).

2. **Render Dashboard** → [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**.

3. **Connect repository** → Select your GitHub repo (e.g. `flight` or `Travel`) → **Connect**.

4. **Apply** the blueprint. Render will:
   - Create a PostgreSQL database (free tier)
   - Create a Web Service
   - Set `DATABASE_URL` and `DIRECT_URL` from the database
   - Generate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
   - Build: `npm install && npx prisma generate && npm run build`
   - Run migrations: `npx prisma migrate deploy`
   - Start: `npm start`

5. **Root directory**: Leave blank so Render uses the repo root (where `package.json` and `render.yaml` live).

6. **Optional env vars** (Dashboard → your service → **Environment**):
   - Add any of the variables below for full functionality (document upload, Redis, payments, etc.).

---

## Required (set by Blueprint)

| Variable            | Set by                    |
|---------------------|---------------------------|
| `NODE_ENV`          | Blueprint → `production`  |
| `PORT`              | Render (do not set)       |
| `API_PREFIX`        | Blueprint → `/api/v1`     |
| `DATABASE_URL`      | From Render PostgreSQL    |
| `DIRECT_URL`        | From Render PostgreSQL    |
| `JWT_ACCESS_SECRET` | Blueprint (generated)     |
| `JWT_REFRESH_SECRET`| Blueprint (generated)     |

---

## Optional (add in Render Dashboard → Environment)

Add these in **Dashboard → travel-pilgrimage-api → Environment** if you use the features.

### Document upload (Supabase)

```
SUPABASE_ENABLED=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_... or eyJ...
SUPABASE_BUCKET=documents
```

### Redis (caching)

```
REDIS_URL=redis://...
REDIS_CACHE_TTL_SECONDS=300
```

(Use Render Redis or an external Redis URL.)

### Payments (Razorpay)

```
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
PAYMENT_WEBHOOK_SECRET=...
```

Webhook URL in Razorpay: `https://<your-render-url>/api/v1/payments/webhook`

### Firebase (push notifications)

```
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=...
```

---

## After deploy

- **API base URL**: `https://<your-service-name>.onrender.com`
- **Health check**: `GET https://<your-service-name>.onrender.com/health`
- **API prefix**: `https://<your-service-name>.onrender.com/api/v1`

Update your frontend (user-app, admin-app) `NEXT_PUBLIC_API_URL` / `VITE_API_URL` to this URL.

---

## Migrations

- **First deploy**: Ensure `prisma/migrations/` is in the repo (not in `.gitignore`) and committed. If you have no migrations yet, run locally once: `npx prisma migrate dev --name init`, then commit the new `prisma/migrations/` folder.
- **New migrations**: Add them locally with `npx prisma migrate dev --name your_migration`, commit, push; Render will run `prisma migrate deploy` on the next deploy.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on `prisma generate` | Ensure `prisma/schema` is at `./prisma` (multi-file schema). |
| Migrations fail | Ensure `prisma/migrations/` is in the repo and not in `.gitignore`. |
| 503 on document upload | Add Supabase env vars (see above). |
| CORS errors from frontend | Backend allows all origins (`origin: true`). If you restrict later, add your frontend URL. |
