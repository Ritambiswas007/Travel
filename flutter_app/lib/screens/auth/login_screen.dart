import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final error = await auth.login(_emailController.text.trim(), _passwordController.text);
    setState(() => _isLoading = false);
    if (mounted) {
      if (error == null) {
        context.go('/');
      } else {
        // Show detailed error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Login Failed',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(error, style: const TextStyle(fontSize: 12)),
              ],
            ),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 6),
            action: SnackBarAction(
              label: 'Dismiss',
              textColor: Colors.white,
              onPressed: () {},
            ),
          ),
        );
      }
    }
  }

  Future<void> _showForgotPasswordDialog() async {
    final emailController = TextEditingController(text: _emailController.text.trim());
    final tokenController = TextEditingController();
    final newPasswordController = TextEditingController();

    final action = await showDialog<String>(
      context: context,
      builder: (context) {
        return SimpleDialog(
          title: const Text('Password help'),
          children: [
            SimpleDialogOption(
              onPressed: () => Navigator.of(context).pop('forgot'),
              child: const Text('Send reset link to email'),
            ),
            SimpleDialogOption(
              onPressed: () => Navigator.of(context).pop('reset'),
              child: const Text('I already have a reset token'),
            ),
          ],
        );
      },
    );

    if (!mounted || action == null) return;
    final auth = context.read<AuthProvider>();

    if (action == 'forgot') {
      final email = await showDialog<String>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Send reset link'),
            content: TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(null),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(emailController.text.trim()),
                child: const Text('Send'),
              ),
            ],
          );
        },
      );
      if (email == null || email.isEmpty) return;
      final error = await auth.forgotPassword(email);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error == null
                ? 'If an account exists for $email, a reset link has been sent.'
                : 'Failed: $error',
          ),
        ),
      );
    } else if (action == 'reset') {
      final result = await showDialog<bool>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Reset password'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: tokenController,
                  decoration: const InputDecoration(labelText: 'Reset token'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: newPasswordController,
                  decoration: const InputDecoration(labelText: 'New password'),
                  obscureText: true,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Reset'),
              ),
            ],
          );
        },
      );
      if (result != true) return;
      final token = tokenController.text.trim();
      final newPassword = newPasswordController.text;
      if (token.isEmpty || newPassword.isEmpty) return;
      final error = await auth.resetPassword(token, newPassword);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error == null ? 'Password reset successfully.' : 'Failed: $error'),
        ),
      );
    }
  }

  Future<void> _loginWithPhone() async {
    final phoneController = TextEditingController();
    final otpController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Login with phone & OTP'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: otpController,
                decoration: const InputDecoration(labelText: 'OTP'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Login'),
            ),
          ],
        );
      },
    );

    if (result != true || !mounted) return;

    final phone = phoneController.text.trim();
    final otp = otpController.text.trim();
    if (phone.isEmpty || otp.isEmpty) return;

    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final error = await auth.loginWithPhone(phone, otp);
    setState(() => _isLoading = false);

    if (!mounted) return;
    if (error == null) {
      context.go('/');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red),
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
                  const SizedBox(height: 32),
                  const Text(
                    'Staff Portal',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFE5E7EB),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sign in to access the staff dashboard',
                    style: TextStyle(fontSize: 15, color: Color(0xFF9CA3AF)),
                  ),
                  const SizedBox(height: 40),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF9CA3AF), size: 22),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Enter email' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF9CA3AF), size: 22),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          color: const Color(0xFF9CA3AF),
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Enter password' : null,
                  ),
                  const SizedBox(height: 32),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _showForgotPasswordDialog,
                      child: const Text(
                        'Forgot password?',
                        style: TextStyle(color: AppColors.primary),
                      ),
                    ),
                  ),
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
                          : const Text('Sign In'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(color: Color(0xFF9CA3AF)),
                      ),
                      GestureDetector(
                        onTap: () => context.go('/signup'),
                        child: const Text(
                          'Create staff account',
                          style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: _isLoading ? null : _loginWithPhone,
                      child: const Text(
                        'Or login with phone & OTP',
                        style: TextStyle(color: AppColors.primary),
                      ),
                    ),
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
