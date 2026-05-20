import { client } from './client';
import type { ApiResponse, StampCard, StampCardDetail, Reward, RewardRedemption, ReferralStats } from '../types/api';

// ─── Stamp Cards ──────────────────────────────────────────────────────────────

export const getStampCards = () =>
  client.get<ApiResponse<StampCard[]>>('/api/v1/customer/stamp-cards')
    .then(r => r.data.data);

export const getStampCardDetail = (id: string) =>
  client.get<ApiResponse<StampCardDetail>>(`/api/v1/customer/stamp-cards/${id}`)
    .then(r => r.data.data);

// ─── Rewards ──────────────────────────────────────────────────────────────────

export interface RewardFilters {
  merchantId?: string;
  lat?: number;
  lon?: number;
  radius?: number;
}

export const getRewards = (filters: RewardFilters = {}) => {
  const params: Record<string, string | number> = {};
  if (filters.merchantId) params.merchantId = filters.merchantId;
  if (filters.lat != null) params.lat = filters.lat;
  if (filters.lon != null) params.lon = filters.lon;
  if (filters.radius != null) params.radius = filters.radius;
  return client.get<ApiResponse<Reward[]>>('/api/v1/rewards', { params })
    .then(r => r.data.data);
};

export const redeemReward = (rewardId: string) =>
  client.post<ApiResponse<RewardRedemption>>(`/api/v1/rewards/${rewardId}/redeem`)
    .then(r => r.data.data);

// ─── Redemptions ──────────────────────────────────────────────────────────────

export const getCustomerRedemptions = () =>
  client.get<ApiResponse<RewardRedemption[]>>('/api/v1/customer/redemptions')
    .then(r => r.data.data);

// ─── Referral ─────────────────────────────────────────────────────────────────

export const getReferralStats = () =>
  client.get<ApiResponse<ReferralStats>>('/api/v1/customer/referral')
    .then(r => r.data.data);
