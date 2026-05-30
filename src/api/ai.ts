import { client } from './client';
import type { ApiResponse, MerchantStats, StampCard, Reward } from '../types/api';

// ─── Reward Suggestion ────────────────────────────────────────────────────────

export interface RewardSuggestion {
  title: string;
  description: string;
  rewardType: 'DISCOUNT' | 'FREE_ITEM' | 'CASHBACK' | 'EXPERIENCE';
  value: number;
  stampRequirement: number;
  terms: string;
}

export const suggestReward = (data: {
  businessName: string;
  businessType: string;
  businessDescription?: string;
}) =>
  client
    .post<ApiResponse<RewardSuggestion>>('/api/v1/ai/reward-suggestion', data)
    .then((r) => r.data.data);

// ─── Business Description ─────────────────────────────────────────────────────

export const generateBusinessDescription = (data: {
  businessName: string;
  businessType: string;
  city?: string;
}) =>
  client
    .post<ApiResponse<{ description: string }>>('/api/v1/ai/business-description', data)
    .then((r) => r.data.data.description);

// ─── Analytics Insights ───────────────────────────────────────────────────────

export const getAnalyticsInsights = (stats: MerchantStats) =>
  client
    .post<ApiResponse<{ insights: string }>>('/api/v1/ai/analytics-insights', { stats })
    .then((r) => r.data.data.insights);

// ─── Reward Recommendations ───────────────────────────────────────────────────

export interface RewardRecommendation {
  rewardId: string;
  reason: string;
}

export const getRewardRecommendations = (data: {
  stampCards: StampCard[];
  availableRewards: Reward[];
  tier: string;
}) =>
  client
    .post<ApiResponse<RewardRecommendation[]>>('/api/v1/ai/reward-recommendations', data)
    .then((r) => r.data.data);
