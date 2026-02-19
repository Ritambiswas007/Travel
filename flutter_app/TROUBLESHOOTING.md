# Flutter App Troubleshooting Guide

## Registration/Login Not Working

### Common Issues

1. **Network Connection Error**
   - **Problem**: `localhost:3000` doesn't work on Android emulator or physical devices
   - **Solution**: Update `lib/core/config.dart` with the correct URL:
     - **Android Emulator**: `http://10.0.2.2:3000`
     - **iOS Simulator**: `http://localhost:3000` (should work)
     - **Physical Device**: Use your computer's local IP (e.g., `http://192.168.1.100:3000`)
   
   To find your computer's IP:
   - **macOS/Linux**: Run `ifconfig` or `ip addr`
   - **Windows**: Run `ipconfig`
   - Look for your local network IP (usually starts with `192.168.x.x` or `10.x.x.x`)

2. **Backend Not Running**
   - Verify backend is running: `curl http://localhost:3000/health`
   - Check backend logs for errors
   - Ensure database migrations are applied

3. **CORS Issues**
   - Backend CORS is configured to allow all origins
   - If you see CORS errors, check backend logs

4. **Error Messages**
   - The app now shows detailed error messages in red SnackBar
   - Check the console/debug output for detailed API request/response logs
   - Enable debug mode to see full API logs

### Debug Steps

1. **Check API Configuration**
   ```dart
   // In lib/core/config.dart
   static const String baseUrl = 'http://10.0.2.2:3000'; // For Android emulator
   ```

2. **Enable Debug Logging**
   - The app now prints API requests/responses in debug mode
   - Check Flutter console for:
     - `API POST: ...`
     - `API Response [200]: ...`
     - `API POST Error: ...`

3. **Test Backend Directly**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Test1234","role":"USER"}'
   ```

4. **Check Error Messages**
   - The registration screen now shows detailed error messages
   - Look for specific error codes (e.g., "Error (400): ...")
   - Common errors:
     - `Network error`: Backend not reachable
     - `Error (400)`: Validation error (check request body)
     - `Error (409)`: Email already registered
     - `Error (500)`: Server error (check backend logs)

### Quick Fix Checklist

- [ ] Backend is running (`npm run dev`)
- [ ] Database migrations applied (`npm run prisma:migrate`)
- [ ] Correct base URL in `lib/core/config.dart`
- [ ] Backend accessible from Flutter app (test with curl)
- [ ] Check Flutter console for detailed error messages
- [ ] Verify email format is valid
- [ ] Ensure password is at least 6 characters

### Testing Registration

1. **In Postman** (should work):
   ```
   POST http://localhost:3000/api/v1/auth/register
   Body: {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Test1234",
     "role": "USER"
   }
   ```

2. **In Flutter App**:
   - Use the same data
   - Check error message if it fails
   - Verify base URL matches your setup
