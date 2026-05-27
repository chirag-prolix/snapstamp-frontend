import { client } from './client';
import type { ApiResponse, AuthResponse, AppUser } from '../types/api';

export const login = (email: string, password: string) =>
  client.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', { email, password })
    .then(r => r.data.data);

export const registerCustomer = (data: {
  email: string; password: string; firstName: string;
  lastName: string; phone: string; referralCode?: string;
}) =>
  client.post<ApiResponse<AuthResponse>>('/api/v1/auth/register/customer', data)
    .then(r => r.data.data);

export const registerMerchant = (data: Record<string, unknown>) =>
  client.post<ApiResponse<{ id: string }>>('/api/v1/auth/register/merchant', data)
    .then(r => r.data.data);

export const logout = () =>
  client.post('/api/v1/auth/logout').then(r => r.data);

export const getMe = () =>
  client.get<ApiResponse<AppUser>>('/api/v1/auth/me')
    .then(r => r.data.data);

export const googleLogin = (idToken: string) =>
  client.post<ApiResponse<AuthResponse>>('/api/v1/auth/google', { idToken })
    .then(r => r.data.data);

export const requestPhoneLoginOtp = (phone: string) =>
  client.post('/api/v1/auth/login/phone', { phone }).then(r => r.data);

export const verifyPhoneLoginOtp = (phone: string, code: string) =>
  client.post<ApiResponse<AuthResponse>>('/api/v1/auth/login/phone/verify', { phone, code })
    .then(r => r.data.data);

export const requestOtp = (type: 'email' | 'phone') =>
  client.post('/api/v1/verification/request', { type }).then(r => r.data);

export const verifyOtp = (type: 'email' | 'phone', code: string) =>
  client.post<ApiResponse<{ isEmailVerified: boolean; isPhoneVerified: boolean }>>(
    '/api/v1/verification/verify', { type, code }
  ).then(r => r.data.data);
