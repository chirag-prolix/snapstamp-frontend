import { useMutation } from '@tanstack/react-query';
import {
  suggestReward,
  generateBusinessDescription,
  getAnalyticsInsights,
  getRewardRecommendations,
} from '../api/ai';

export const useRewardSuggestion = () =>
  useMutation({ mutationFn: suggestReward });

export const useBusinessDescription = () =>
  useMutation({ mutationFn: generateBusinessDescription });

export const useAnalyticsInsights = () =>
  useMutation({ mutationFn: getAnalyticsInsights });

export const useRewardRecommendations = () =>
  useMutation({ mutationFn: getRewardRecommendations });
