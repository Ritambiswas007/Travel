# Neon Database Setup Guide

## ✅ Configuration Complete

Your Neon PostgreSQL database has been configured with:
- **Pooled connection** (DATABASE_URL) - for Prisma Client (app runtime)
- **Direct connection** (DIRECT_URL) - for Prisma Migrations

## 🔧 Current Configuration

The `.env` file is configured with:
- `DATABASE_URL`: Pooler endpoint (for your app)
- `DIRECT_URL`: Direct endpoint (for migrations)

## 🚀 Running Migrations

### Option 1: Run from Your Local Machine

The TLS certificate error might be specific to the sandbox environment. Try running migrations from your local machine:

```bash
cd /Users/ritambiswas/flight
npm run prisma:migrate:deploy
```

### Option 2: If TLS Errors Persist

If you still get TLS certificate errors, try these solutions:

#### Solution A: Update Node.js/OpenSSL
```bash
# Update Node.js to latest LTS version
node --version  # Should be 18+ or 20+

# On macOS, update certificates
brew update
brew upgrade openssl
```

#### Solution B: Use Different SSL Mode (Testing Only)
Temporarily modify `.env` to use:
```env
DIRECT_URL="postgresql://neondb_owner:npg_GpI3MxKnk8PW@ep-quiet-mode-ai0fhgm7.c-4.us-east-1.aws.neon.tech/neondb?schema=public&sslmode=prefer"
```

#### Solution C: Get Direct Connection URL from Neon Dashboard
1. Go to Neon Dashboard: https://console.neon.tech
2. Select your project
3. Go to **Connection Details**
4. Copy the **Direct connection** string (NOT the pooler)
5. Update `DIRECT_URL` in `.env`

## 📋 Verify Connection Strings

Make sure you have BOTH connection strings:

1. **Pooler** (ends with `-pooler`): For Prisma Client
   ```
   ep-quiet-mode-ai0fhgm7-pooler.c-4.us-east-1.aws.neon.tech
   ```

2. **Direct** (NO `-pooler`): For Migrations
   ```
   ep-quiet-mode-ai0fhgm7.c-4.us-east-1.aws.neon.tech
   ```

## ✅ After Migrations Succeed

Once migrations complete successfully:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test the APIs:**
   ```bash
   node test-all-apis.js
   ```

3. **View database in Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```

## 🔍 Troubleshooting

### Error: "Can't reach database server"
- Check if database is active in Neon dashboard
- Verify connection strings are correct
- Check network connectivity

### Error: "TLS certificate error"
- Update Node.js to latest version
- Try `sslmode=prefer` instead of `require`
- Check OpenSSL configuration
- Run from local machine (not sandbox)

### Error: "Authentication failed"
- Verify username: `neondb_owner`
- Verify password: `npg_GpI3MxKnk8PW`
- Check if password needs URL encoding

## 📝 Next Steps

1. ✅ Database connection configured
2. ⏳ Run migrations (from local machine)
3. ⏳ Start server
4. ⏳ Test all APIs
5. ⏳ Configure Firebase (when ready)
