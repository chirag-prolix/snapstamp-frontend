import { client } from './client';
import type { ApiResponse, Reward, RewardRedemption, MerchantStats, StampCardDetail, MerchantUser, Payment, SubscribeOrderResponse } from '../types/api';

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const getMerchantRewards = () =>
  client.get<ApiResponse<Reward[]>>('/api/v1/merchant/rewards').then(r => r.data.data);

export interface CreateRewardData {
  title: string;
  description: string;
  rewardType: string;
  value: string;
  stampRequirement?: number;
  maxRedemptions?: number | null;
  expiresAt: string;
  terms?: string;
}

export const createReward = (data: CreateRewardData) =>
  client.post<ApiResponse<Reward>>('/api/v1/merchant/rewards', data).then(r => r.data.data);

// ─── Redemptions ──────────────────────────────────────────────────────────────

export const getMerchantRedemptions = () =>
  client.get<ApiResponse<RewardRedemption[]>>('/api/v1/merchant/redemptions').then(r => r.data.data);

export const approveRedemption = (redeemCode: string) =>
  client.post<ApiResponse<RewardRedemption>>(`/api/v1/merchant/redemptions/${redeemCode}/approve`)
    .then(r => r.data.data);

// ─── Stamps ───────────────────────────────────────────────────────────────────

export interface IssueStampsData {
  customerId?: string;
  customerPhone?: string;
  count: number;
  transactionId?: string;
  notes?: string;
  isBonus?: boolean;
  cardExpiresAt?: string;
}

export const issueStamps = (data: IssueStampsData) =>
  client.post<ApiResponse<StampCardDetail>>('/api/v1/stamps/issue', data).then(r => r.data.data);

export const getCustomerCard = (customerId: string) =>
  client.get<ApiResponse<StampCardDetail>>(`/api/v1/stamps/card/${customerId}`).then(r => r.data.data);

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getMerchantProfile = () =>
  client.get<ApiResponse<MerchantUser>>('/api/v1/merchant/profile').then(r => r.data.data);

export const updateMerchantProfile = (data: Partial<MerchantUser>) =>
  client.patch<ApiResponse<MerchantUser>>('/api/v1/merchant/profile', data).then(r => r.data.data);

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getMerchantStats = () =>
  client.get<ApiResponse<MerchantStats>>('/api/v1/merchant/stats').then(r => r.data.data);

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getMerchantPayments = () =>
  client.get<ApiResponse<Payment[]>>('/api/v1/merchant/payments').then(r => r.data.data);

export const createSubscriptionOrder = (plan: 'monthly' | 'annual') =>
  client.post<ApiResponse<SubscribeOrderResponse>>('/api/v1/merchant/payment/subscribe', { plan })
    .then(r => r.data.data);

export interface VerifyPaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const verifyPayment = (data: VerifyPaymentData) =>
  client.post('/api/v1/merchant/payment/verify', data).then(r => r.data);
