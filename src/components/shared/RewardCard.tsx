import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Reward, RewardType } from '../../types/api';

const typeColors: Record<RewardType, string> = {
  DISCOUNT:   'blue',
  FREE_ITEM:  'green',
  CASHBACK:   'yellow',
  EXPERIENCE: 'purple',
};

interface RewardCardProps {
  reward: Reward;
  onRedeem?: () => void;
  isRedeeming?: boolean;
}

export function RewardCard({ reward, onRedeem, isRedeeming }: RewardCardProps) {
  const expired = new Date(reward.expiresAt) < new Date();

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <Badge color={typeColors[reward.rewardType] as any}>{reward.rewardType.replace('_', ' ')}</Badge>
          {reward.distanceKm != null && (
            <span className="text-xs text-gray-400">{reward.distanceKm} km away</span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mt-1">{reward.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{reward.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-sm text-indigo-600 font-medium">
              {reward.stampRequirement} stamps required
            </p>
            <p className="text-xs text-gray-400">
              {expired
                ? 'Expired'
                : `Expires ${new Date(reward.expiresAt).toLocaleDateString()}`}
            </p>
          </div>
          {onRedeem && (
            <Button
              size="sm"
              onClick={onRedeem}
              isLoading={isRedeeming}
              disabled={expired}
            >
              Redeem
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
