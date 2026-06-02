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
  const displayStampCount = reward.customerStampCount != null
    ? Math.min(reward.customerStampCount, reward.stampRequirement)
    : null;
  const hasEnoughStamps = reward.customerStampCount != null && reward.customerStampCount >= reward.stampRequirement;
  const pct = displayStampCount != null ? Math.round((displayStampCount / reward.stampRequirement) * 100) : 0;

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <Badge color={typeColors[reward.rewardType] as any}>{reward.rewardType.replace('_', ' ')}</Badge>
          {reward.distanceKm != null && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{reward.distanceKm} km away</span>
          )}
        </div>
        <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{reward.title}</h3>
        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{reward.description}</p>

        {/* Stamp progress bar */}
        {displayStampCount != null && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                {displayStampCount} / {reward.stampRequirement} stamps
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {expired ? 'Expired' : `Expires ${new Date(reward.expiresAt).toLocaleDateString()}`}
          </p>
          {onRedeem && (
            <Button
              size="sm"
              onClick={onRedeem}
              isLoading={isRedeeming}
              disabled={expired || !hasEnoughStamps || !!reward.hasActiveRedemption}
            >
              {reward.hasActiveRedemption ? 'Pending' : 'Redeem'}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
