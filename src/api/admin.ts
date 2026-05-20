import { client } from './client';
import type { ApiResponse, AdminStats, MerchantUser } from '../types/api';

export const getAdminStats = () =>
  client.get<ApiResponse<AdminStats>>('/api/v1/admin/stats').then(r => r.data.data);

export const getAdminMerchants = (status?: string) =>
  client.get<ApiResponse<MerchantUser[]>>('/api/v1/admin/merchants', {
    params: status ? { status } : {},
  }).then(r => r.data.data);

export const getMerchantById = (id: string) =>
  client.get<ApiResponse<MerchantUser>>(`/api/v1/admin/merchants/${id}`).then(r => r.data.data);

export const approveMerchant = (id: string) =>
  client.post<ApiResponse<MerchantUser>>(`/api/v1/admin/merchants/${id}/approve`).then(r => r.data.data);

export const rejectMerchant = (id: string, reason: string) =>
  client.post(`/api/v1/admin/merchants/${id}/reject`, { reason }).then(r => r.data);
