# Travel & Pilgrimage – Flutter App

Mobile app for the Travel & Pilgrimage API. UI is based on the provided reference screens: Home (Discover / Best Destination), All Popular Trip Packages list, Package Details (hero + Book Now), and Sign up (dark theme).

## Setup

1. Install Flutter SDK (3.2+).
2. From `flutter_app/` run:
   - `flutter pub get`
   - `flutter run` (with device/emulator)

## Configuration

### API Base URL

Update `lib/core/config.dart` to set your backend URL:

```dart
static const String baseUrl = 'http://localhost:3000'; // Change this
```

**Important URLs for different setups:**
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://localhost:3000`
- **Physical Device**: Use your computer's IP (e.g., `http://192.168.1.100:3000`)

The API prefix `/api/v1` is configured automatically.

## Features

- **Auth**: Login (email/password), Sign up (name, email, password, dark UI), token stored securely.
- **Home**: “Discover the wonders of the world!”, Best Destination horizontal list (from List packages with `isFeatured=true`), View all → package list.
- **Packages list**: “All Popular Trip Package” – cards with image, name, price, date range, rating, “X Person Joined”.
- **Package detail**: Hero image, destination name, location, rating, price per person, image gallery strip, About Destination, Book Now (placeholder for Create booking API).
- **Bottom nav**: Home, calendar, Search (orange FAB), Messages, Profile.

## API Endpoints Integrated

### Authentication
- `POST /auth/register` – Sign up (with error handling)
- `POST /auth/login/email` – Login (with error handling)

### Packages
- `GET /packages?page=1&limit=10&isFeatured=true` – Featured packages (Best Destination)
- `GET /packages?page=1&limit=20` – All packages
- `GET /packages/:id` – Package by ID

### Services Available (Ready to Use)
- `BookingService` – Create bookings, get my bookings, confirm/cancel
- `CityService` – List cities, get city by ID/slug
- `ReviewService` – List reviews, create review
- `PaymentService` – Create payment orders, get payment details

All services use the same `ApiClient` with automatic authentication token handling.

## Troubleshooting

### Registration/Login Fails
1. Check that backend is running on the configured URL
2. Verify backend URL in `lib/core/config.dart` matches your setup
3. Check error message in the SnackBar - it shows the actual API error
4. Ensure backend database has the `name` field in User model (run migrations)

### Network Errors
- **Android Emulator**: Use `http://10.0.2.2:3000` instead of `localhost`
- **Physical Device**: Use your computer's local IP address
- Check that backend CORS allows your Flutter app origin

### API Connection Issues
- Verify backend is running: `curl http://localhost:3000/health`
- Check API base URL in `lib/core/config.dart`
- Ensure backend has proper CORS configuration
