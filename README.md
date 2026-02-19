# Travel & Pilgrimage Management Platform - Backend API

A comprehensive REST API backend for managing travel packages, bookings, payments, visa applications, and more. Built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- **100+ API Endpoints** covering all aspects of travel management
- **Authentication & Authorization** - JWT-based auth with role-based access control (USER, STAFF, ADMIN)
- **Package Management** - Create, list, and manage travel packages with variants, schedules, and itineraries
- **Booking System** - Complete booking flow with travelers, addons, and coupon support
- **Payment Integration** - Razorpay and Cashfree payment gateways with webhook support
- **Document Management** - File uploads with Supabase Storage, document verification workflow
- **Visa Applications** - Visa application management with document attachments
- **Support Tickets** - Customer support ticket system
- **Reviews & Ratings** - Package reviews and ratings
- **Notifications** - Email, SMS, and push notifications (Firebase)
- **AI Integration** - AI-powered recommendations, FAQ, and booking assistant
- **Reports & Analytics** - Bookings and revenue reports for staff
- **Lead Management** - Facebook leads webhook integration
- **Caching** - Redis caching for improved performance
- **File Uploads** - Multer-based file uploads with validation

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** database (Supabase, Neon, or self-hosted)
- **npm** or **yarn**

Optional:
- **Redis** (for caching)
- **Supabase** account (for file storage)
- **Firebase** account (for push notifications)
- **Razorpay/Cashfree** account (for payments)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000` (or your configured PORT).

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&sslmode=require

# JWT Authentication
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Optional

```env
# Redis (for caching)
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL_SECONDS=300

# Supabase Storage (for file uploads)
SUPABASE_ENABLED=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET=documents

# Firebase (for push notifications)
FIREBASE_ENABLED=false
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Payment Gateway (Razorpay)
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
PAYMENT_WEBHOOK_SECRET=your-webhook-secret

# Payment Gateway (Cashfree - alternative)
# PAYMENT_PROVIDER=cashfree
# CASHFREE_APP_ID=your-app-id
# CASHFREE_SECRET=your-secret

# Facebook Leads
FACEBOOK_LEADS_ENABLED=false
FACEBOOK_VERIFY_TOKEN=your-verify-token
FACEBOOK_PAGE_ACCESS_TOKEN=your-page-access-token

# PDF Service
PDF_SERVICE_ENABLED=false
PDF_SERVICE_URL=https://your-pdf-service.com

# AI Bot
AI_BOT_ENABLED=false
AI_RECOMMENDATION_HOOK=https://your-ai-service.com/recommendations
AI_FAQ_HOOK=https://your-ai-service.com/faq
AI_BOOKING_ASSISTANT_HOOK=https://your-ai-service.com/assistant

# Notifications
EMAIL_NOTIFICATIONS_ENABLED=false
SMS_NOTIFICATIONS_ENABLED=false
PUSH_NOTIFICATIONS_ENABLED=false
```

## 📚 API Documentation

### Postman Collection

Import the Postman collection from `docs/Travel-Pilgrimage-API.postman_collection.json` to explore all 100+ endpoints.

### API Base URL

```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login/email` - Login with email/password
- `POST /auth/login/phone` - Login with phone/OTP
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

#### Packages
- `GET /packages` - List all packages (public)
- `GET /packages/:id` - Get package by ID (public)
- `GET /packages/slug/:slug` - Get package by slug (public)
- `POST /packages` - Create package (ADMIN)
- `PATCH /packages/:id` - Update package (ADMIN)

#### Bookings
- `POST /bookings` - Create booking (USER)
- `GET /bookings/my` - List my bookings (USER)
- `GET /bookings/admin` - List all bookings (STAFF)
- `POST /bookings/:id/confirm` - Confirm booking
- `POST /bookings/:id/cancel` - Cancel booking

#### Payments
- `POST /payments/orders` - Create payment order (USER)
- `GET /payments/booking/:bookingId` - Get payment by booking
- `POST /payments/webhook` - Payment webhook (Razorpay/Cashfree)

#### Documents
- `POST /documents/upload` - Upload document (multipart/form-data)
- `GET /documents/my` - List my documents (USER)
- `GET /documents/types` - List document types

See `docs/API_CURL_REFERENCE.md` for detailed API documentation.

## 🗂️ Project Structure

```
.
├── src/
│   ├── config/          # Configuration files (env, prisma, firebase, supabase)
│   ├── middlewares/     # Express middlewares (auth, error handling, cache, upload)
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication & authorization
│   │   ├── users/       # User management
│   │   ├── packages/    # Package management
│   │   ├── bookings/    # Booking system
│   │   ├── payments/    # Payment processing
│   │   ├── documents/   # Document management
│   │   ├── visa/        # Visa applications
│   │   ├── support/     # Support tickets
│   │   └── ...          # Other modules
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schemas/         # Prisma schema files (modular)
│   └── main.prisma      # Main schema file
├── docs/                # Documentation
│   ├── Travel-Pilgrimage-API.postman_collection.json
│   └── API_CURL_REFERENCE.md
├── dist/                # Compiled JavaScript (generated)
└── package.json
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### Test Scripts

The repository includes test scripts for API endpoints. See `SETUP.md` for testing instructions.

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password encryption
- **Input Validation** - express-validator for request validation
- **CORS** - Configurable CORS policies
- **Helmet** - Security headers
- **Rate Limiting** - (Can be added via middleware)
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **File Upload Validation** - File type and size validation

## 📦 Database Schema

The database schema is managed with Prisma. Key models include:

- **User** - User accounts (USER, STAFF, ADMIN roles)
- **Package** - Travel packages with variants, schedules, and itineraries
- **Booking** - Bookings with travelers and addons
- **Payment** - Payment transactions and refunds
- **Document** - User documents with verification workflow
- **VisaApplication** - Visa applications with documents
- **SupportTicket** - Support tickets with messages
- **Review** - Package reviews and ratings

See `prisma/schemas/` for detailed schema definitions.

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production database URL
4. Set up Redis for caching (recommended)
5. Configure payment gateway webhooks
6. Set up file storage (Supabase S3)
7. Configure Firebase for push notifications
8. Set up monitoring and logging
9. Use environment variables for all secrets
10. Run migrations: `npm run prisma:migrate:deploy`

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations (dev)
- `npm run prisma:migrate:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the documentation in `docs/`
- Review `SETUP.md` for setup instructions
- Check `TEST_RESULTS.md` for API testing results

## 🙏 Acknowledgments

- Express.js - Web framework
- Prisma - Database ORM
- TypeScript - Type safety
- Supabase - File storage
- Firebase - Push notifications
- Razorpay/Cashfree - Payment gateways

---

**Built with ❤️ for Travel & Pilgrimage Management**
