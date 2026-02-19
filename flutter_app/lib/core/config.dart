class AppConfig {
  // Change this to your backend URL
  // For Android emulator: use http://10.0.2.2:3000
  // For iOS simulator: use http://localhost:3000
  // For physical device: use your computer's IP address, e.g., http://192.168.1.100:3000
  static const String baseUrl = 'http://10.0.2.2:3000'; // Fixed for Android emulator
  static const String apiPrefix = '/api/v1';
  
  static String get apiBaseUrl => '$baseUrl$apiPrefix';
}
