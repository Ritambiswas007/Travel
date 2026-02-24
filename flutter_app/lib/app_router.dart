import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'core/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/main_nav_shell.dart';
import 'screens/bookings/booking_detail_screen.dart';
import 'screens/leads/lead_detail_screen.dart';
import 'screens/support/support_detail_screen.dart';
import 'screens/support/support_screen.dart';
import 'screens/bookings/bookings_screen.dart';
import 'screens/leads/leads_screen.dart';
import 'screens/reports/reports_screen.dart';
import 'screens/documents/documents_screen.dart';
import 'screens/forms/forms_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/documents/document_type_detail_screen.dart';
import 'screens/forms/form_detail_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

GoRouter createAppRouter(Listenable? refreshListenable) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    refreshListenable: refreshListenable ?? Listenable.merge([]),
    initialLocation: '/login',
    redirect: (context, state) {
      final auth = context.read<AuthProvider>();
      if (auth.isLoading) return null;

      final location = state.matchedLocation;
      final isAuthRoute = location == '/login' || location == '/signup';

      if (!auth.isLoggedIn && !isAuthRoute) return '/login';
      if (auth.isLoggedIn && isAuthRoute) return '/';

      // Ensure only STAFF/ADMIN can access
      if (auth.isLoggedIn && auth.user != null) {
        if (auth.user!.role != 'STAFF' && auth.user!.role != 'ADMIN') {
          return '/login';
        }
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (_, __) => const SignUpScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (_, __) => const MainNavShell(),
      ),
      GoRoute(
        path: '/bookings',
        builder: (_, __) => const BookingsScreen(),
      ),
      GoRoute(
        path: '/leads',
        builder: (_, __) => const LeadsScreen(),
      ),
      GoRoute(
        path: '/reports',
        builder: (_, __) => const ReportsScreen(),
      ),
      GoRoute(
        path: '/booking/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return BookingDetailScreen(bookingId: id);
        },
      ),
      GoRoute(
        path: '/lead/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return LeadDetailScreen(leadId: id);
        },
      ),
      GoRoute(
        path: '/support/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return SupportDetailScreen(ticketId: id);
        },
      ),
      GoRoute(
        path: '/support-list',
        builder: (_, __) => const SupportScreen(),
      ),
      GoRoute(
        path: '/documents',
        builder: (_, __) => const DocumentsScreen(),
      ),
      GoRoute(
        path: '/documents/types/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return DocumentTypeDetailScreen(typeId: id);
        },
      ),
      GoRoute(
        path: '/forms',
        builder: (_, __) => const FormsScreen(),
      ),
      GoRoute(
        path: '/forms/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return FormDetailScreen(formId: id);
        },
      ),
      GoRoute(
        path: '/notifications',
        builder: (_, __) => const NotificationsScreen(),
      ),
    ],
  );
}
