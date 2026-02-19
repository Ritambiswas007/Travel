# Database Connection Fix Guide

## 🔍 Issue Identified

The connection is failing with `ENOTFOUND` error, which means DNS cannot resolve the hostname. This typically indicates:

1. **Database is paused** in Supabase dashboard
2. **Incorrect connection string** format
3. **Network/DNS issues**

## ✅ Step-by-Step Fix

### Step 1: Verify Supabase Database Status

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Check if the database is **paused** (it might show a "Resume" button)
5. If paused, click **"Resume"** to activate the database

### Step 2: Get the Correct Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **"URI"** format (not Transaction or Session)
4. Copy the connection string - it should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 3: Update .env File

Replace the `DATABASE_URL` in your `.env` file with the connection string from Supabase dashboard.

**Important Notes:**
- If your password contains special characters like `@`, they need to be URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - etc.

### Step 4: Test Connection

Run the diagnostic script:
```bash
node test-db-connection.js
```

Or test directly:
```bash
npm run prisma:migrate:deploy
```

## 🔧 Alternative Connection String Formats

If the direct connection doesn't work, try these formats:

### Format 1: Direct Connection (Port 5432)
```env
DATABASE_URL="postgresql://postgres:RitamTitan%40007@db.olhbzxdikriyitnrkoha.supabase.co:5432/postgres?schema=public&sslmode=require"
```

### Format 2: Connection Pooler (Port 6543) - Recommended for Production
```env
DATABASE_URL="postgresql://postgres.olhbzxdikriyitnrkoha:RitamTitan%40007@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true&sslmode=require"
```

### Format 3: Transaction Mode (Port 6543) - For Serverless
```env
DATABASE_URL="postgresql://postgres.olhbzxdikriyitnrkoha:RitamTitan%40007@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public&pgbouncer=true&connection_limit=1&sslmode=require"
```

**Note:** Replace `[REGION]` with your actual Supabase region (e.g., `us-east-1`, `ap-south-1`, etc.)

## 🚨 Common Issues & Solutions

### Issue 1: Database Paused
**Symptom:** `ENOTFOUND` or `Can't reach database server`
**Solution:** Resume database in Supabase dashboard

### Issue 2: IP Not Whitelisted
**Symptom:** Connection timeout
**Solution:** 
- Go to Supabase Dashboard → Settings → Database
- Check "Connection Pooling" settings
- Add your IP address to whitelist (or disable IP restrictions for testing)

### Issue 3: Wrong Password
**Symptom:** Authentication failed
**Solution:** 
- Verify password in Supabase dashboard
- Ensure special characters are URL-encoded in connection string

### Issue 4: SSL Certificate Issues
**Symptom:** SSL connection errors
**Solution:** Try different SSL modes:
- `sslmode=prefer` (tries SSL, falls back if not available)
- `sslmode=require` (requires SSL)
- `sslmode=disable` (no SSL - not recommended for production)

## 📋 Quick Checklist

- [ ] Database is active (not paused) in Supabase dashboard
- [ ] Connection string copied from Supabase dashboard (Settings → Database)
- [ ] Password is URL-encoded (special characters converted)
- [ ] `.env` file has correct `DATABASE_URL`
- [ ] Network can reach Supabase servers
- [ ] IP address is whitelisted (if restrictions enabled)

## 🔗 Useful Links

- [Supabase Database Settings](https://supabase.com/dashboard/project/_/settings/database)
- [Supabase Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/database/prisma)

## 💡 Next Steps After Connection Works

Once the connection is working:

1. Run migrations:
   ```bash
   npm run prisma:migrate:deploy
   ```

2. Verify connection:
   ```bash
   npm run prisma:studio
   ```
   This opens Prisma Studio to view your database

3. Start the server:
   ```bash
   npm run dev
   ```

4. Run API tests:
   ```bash
   node test-all-apis.js
   ```
