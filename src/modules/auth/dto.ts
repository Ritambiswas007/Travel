export interface LoginEmailDto {
  email: string;
  password: string;
}

export interface LoginPhoneDto {
  phone: string;
  otp: string;
}

export interface SendOtpDto {
  email?: string;
  phone?: string;
  purpose: 'login' | 'register' | 'forgot_password' | 'verify';
}

export interface RegisterDto {
  email?: string;
  phone?: string;
  password?: string;
  name: string;
  role?: 'USER' | 'STAFF' | 'ADMIN';
}

export interface ForgotPasswordDto {
  email?: string;
  phone?: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    name?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
