# Travel & Pilgrimage – Flutter App

Mobile app for the Travel & Pilgrimage API. UI is based on the provided reference screens: Home (Discover / Best Destination), All Popular Trip Packages list, Package Details (hero + Book Now), and Sign up (dark theme).

## Setup

1. Install Flutter SDK (3.2+).
2. From `flutter_app/` run:
   - `flutter pub get`
   - `flutter run` (with device/emulator)

## Configuration

- **API base URL**: Default is `http://localhost:3000`. To change it, update `ApiClient` in `lib/core/api_client.dart` (e.g. pass `baseUrl` in the constructor or read from env).
- **API prefix**: `/api/v1` (matches Postman collection).

## Features

- **Auth**: Login (email/password), Sign up (name, email, password, dark UI), token stored securely.
- **Home**: “Discover the wonders of the world!”, Best Destination horizontal list (from List packages with `isFeatured=true`), View all → package list.
- **Packages list**: “All Popular Trip Package” – cards with image, name, price, date range, rating, “X Person Joined”.
- **Package detail**: Hero image, destination name, location, rating, price per person, image gallery strip, About Destination, Book Now (placeholder for Create booking API).
- **Bottom nav**: Home, calendar, Search (orange FAB), Messages, Profile.

## API Endpoints Used

- `POST /auth/register` – Sign up
- `POST /auth/login/email` – Login
- `GET /packages?page=1&limit=10&isFeatured=true` – Featured (Best Destination)
- `GET /packages?page=1&limit=20` – All packages
- `GET /packages/:id` – Package by ID

Other endpoints from the Postman collection (bookings, payments, profile, etc.) can be wired the same way via `ApiClient` and auth token.
