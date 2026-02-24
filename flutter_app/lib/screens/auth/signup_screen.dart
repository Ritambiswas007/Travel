import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // Staff registration is disabled - accounts are created by administrators
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Staff accounts are created by administrators. Please contact your admin for access.',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 5),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        scaffoldBackgroundColor: AppColors.backgroundDark,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          surface: AppColors.backgroundDark,
          onSurface: Colors.white,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF2A2A2A),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
        ),
      ),
      child: Scaffold(
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 24),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 22),
                      onPressed: () => context.pop(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Sign up now',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFE5E7EB),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Please fill the details and create account',
                    style: TextStyle(fontSize: 15, color: Color(0xFF9CA3AF)),
                  ),
                  const SizedBox(height: 40),
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(hintText: 'Full name'),
                    validator: (v) => v == null || v.isEmpty ? 'Enter name' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(hintText: 'Email'),
                    validator: (v) => v == null || v.isEmpty ? 'Enter email' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          color: const Color(0xFF9CA3AF),
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Enter password';
                      if (v.length < 8) return 'Password must be 8 character';
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Password must be 8 character',
                    style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      child: _isLoading
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Sign Up'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Already have an account ', style: TextStyle(color: Color(0xFF9CA3AF))),
                      GestureDetector(
                        onTap: () => context.go('/login'),
                        child: const Text('Sign In', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 48),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _SocialButton(icon: Icons.facebook, color: const Color(0xFF1877F2)),
                      const SizedBox(width: 20),
                      _SocialButton(
                        icon: Icons.camera_alt,
                        color: const Color(0xFFE4405F),
                        gradient: const [Color(0xFFF58529), Color(0xFFDD2A7B)],
                      ),
                      const SizedBox(width: 20),
                      _SocialButton(icon: Icons.alternate_email, color: const Color(0xFF1DA1F2)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  const _SocialButton({required this.icon, required this.color, this.gradient});

  final IconData icon;
  final Color color;
  final List<Color>? gradient;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: gradient == null ? color : null,
        gradient: gradient != null ? LinearGradient(colors: gradient!) : null,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 28),
    );
  }
}
