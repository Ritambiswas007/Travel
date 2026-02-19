import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'core/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/package_list/package_list_screen.dart';
import 'screens/package_detail/package_detail_screen.dart';
import 'screens/main_nav_shell.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

GoRouter createAppRouter(Listenable? refreshListenable) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    refreshListenable: refreshListenable ?? Listenable.merge([]),
    initialLocation: '/login',
    redirect: (context, state) {
      final auth = context.read<AuthProvider>();
      if (auth.isLoading) return null;
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/signup';
      if (!auth.isLoggedIn && !isAuthRoute) return '/login';
      if (auth.isLoggedIn && isAuthRoute) return '/';
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
        path: '/packages',
        builder: (_, __) => const PackageListScreen(),
      ),
      GoRoute(
        path: '/package/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return PackageDetailScreen(packageId: id);
        },
      ),
    ],
  );
}
