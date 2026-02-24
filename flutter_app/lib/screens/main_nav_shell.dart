import 'package:flutter/material.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'home/home_screen.dart';
import 'bookings/bookings_screen.dart';
import 'leads/leads_screen.dart';
import 'reports/reports_screen.dart';
import 'profile/profile_screen.dart';

class MainNavShell extends StatefulWidget {
  const MainNavShell({super.key});

  @override
  State<MainNavShell> createState() => _MainNavShellState();
}

class _MainNavShellState extends State<MainNavShell> {
  int _currentIndex = 0;
  final List<Widget> _pages = [
    const HomeScreen(),
    const BookingsScreen(),
    const LeadsScreen(),
    const ReportsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Color(0x1A000000), blurRadius: 8, offset: Offset(0, -2))],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.dashboard_outlined,
                  label: 'Dashboard',
                  selected: _currentIndex == 0,
                  onTap: () => setState(() => _currentIndex = 0),
                ),
                _NavItem(
                  icon: Icons.book_online,
                  label: 'Bookings',
                  selected: _currentIndex == 1,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                _NavItem(
                  icon: Icons.people_outline,
                  label: 'Leads',
                  selected: _currentIndex == 2,
                  onTap: () => setState(() => _currentIndex = 2),
                ),
                _NavItem(
                  icon: Icons.assessment,
                  label: 'Reports',
                  selected: _currentIndex == 3,
                  onTap: () => setState(() => _currentIndex = 3),
                ),
                _NavItem(
                  icon: Icons.person_outline,
                  label: 'Profile',
                  selected: _currentIndex == 4,
                  onTap: () => setState(() => _currentIndex = 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 26,
            color: selected ? AppColors.primary : AppColors.textSecondary,
          ),
          if (label.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: selected ? AppColors.primary : AppColors.textSecondary,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

