# Staff Portal - Flutter App

**This is a staff-only application** for managing bookings, leads, reports, and customer support for the Travel & Pilgrimage platform.

## 🎯 Purpose

This Flutter app is designed exclusively for **staff members** to:
- Manage all bookings (view, update status, confirm, cancel)
- Track and assign leads
- Generate and view reports (bookings, revenue)
- Handle support tickets
- View dashboard metrics

## ⚠️ Important: Staff-Only Access

- **Only STAFF and ADMIN roles can log in**
- User registration is disabled (staff accounts are created by administrators)
- Regular users (USER role) cannot access this app
- If a non-staff user attempts to login, they will receive an "Access denied" message

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (>=3.2.0)
- Backend API running and accessible
- Staff account credentials (provided by administrator)

### Configuration

1. **Update API Base URL** in `lib/core/config.dart`:
   ```dart
   static const String baseUrl = 'http://10.0.2.2:3000'; // Android emulator
   // OR
   static const String baseUrl = 'http://192.168.1.XXX:3000'; // Physical device
   ```

2. **Install Dependencies**:
   ```bash
   flutter pub get
   ```

3. **Run the App**:
   ```bash
   flutter run
   ```

## 📱 Features

### Dashboard
- Overview of total bookings, pending leads, and today's revenue
- Quick access to all major features

### Bookings Management
- View all bookings (staff endpoint: `/bookings/admin`)
- Filter by status, search by customer
- Update booking status, confirm, or cancel bookings
- View booking details and traveler information

### Leads Management
- List all leads with filtering options
- View lead details
- Update lead status (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
- Assign leads to staff members
- Track lead scores

### Reports
- Generate bookings reports by date range
- Generate revenue reports
- View historical reports
- Export report data

### Support Tickets
- View all customer support tickets
- Respond to tickets
- Update ticket status
- Track ticket history

## 🔐 Authentication

- **Login Endpoint**: `/auth/login/email`
- **Required Role**: STAFF or ADMIN
- **No Registration**: Staff accounts must be created by administrators via the admin panel or API

## 📋 Staff API Endpoints Integrated

### Bookings
- `GET /bookings/admin` - List all bookings
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id` - Update booking step
- `POST /bookings/:id/confirm` - Confirm booking
- `POST /bookings/:id/cancel` - Cancel booking

### Leads
- `GET /leads` - List all leads
- `GET /leads/:id` - Get lead details
- `PATCH /leads/:id` - Update lead
- `POST /leads/:id/assign` - Assign lead to staff

### Reports
- `POST /reports` - Create report
- `GET /reports` - List reports
- `GET /reports/bookings` - Bookings report
- `GET /reports/revenue` - Revenue report
- `GET /reports/:id` - Get report by ID

### Support
- `GET /support` - List all tickets
- `GET /support/:id` - Get ticket details
- `POST /support/:id/messages` - Send message
- `PATCH /support/:id` - Update ticket status

## 🛠️ Development

### Project Structure

```
lib/
├── core/
│   ├── api_client.dart          # HTTP client with auth
│   ├── auth_provider.dart       # Authentication state management
│   ├── config.dart              # App configuration
│   ├── models/                  # Data models
│   └── services/                # API service classes
│       ├── booking_service.dart
│       ├── lead_service.dart
│       ├── report_service.dart
│       └── support_service.dart
├── screens/
│   ├── auth/
│   │   └── login_screen.dart   # Staff login (no signup)
│   ├── home/
│   │   └── home_screen.dart     # Staff dashboard
│   └── main_nav_shell.dart      # Bottom navigation
└── app_router.dart              # Navigation routing
```

## 🔒 Security Notes

- Access tokens are stored securely using `flutter_secure_storage`
- Role validation happens on both client and server
- All API requests include Bearer token authentication
- Staff-only endpoints are enforced by backend middleware

## 📝 Notes

- This app does NOT include user-facing features like package browsing or booking creation
- This app does NOT include admin-only features like creating staff accounts or managing packages
- All user-facing features should be in a separate customer app
- All admin features should be in a separate admin panel

## 🐛 Troubleshooting

### Login Fails with "Access denied"
- Ensure you're using a STAFF or ADMIN account
- Verify the account was created correctly in the backend
- Check backend logs for authentication errors

### Network Errors
- Verify backend URL in `lib/core/config.dart`
- For Android emulator: use `http://10.0.2.2:3000`
- For physical device: use your computer's local IP address
- Ensure backend CORS allows your app origin

### API Errors
- Check backend logs for detailed error messages
- Verify staff account has proper permissions
- Ensure backend database migrations are applied

## 📄 License

See LICENSE file for details.
