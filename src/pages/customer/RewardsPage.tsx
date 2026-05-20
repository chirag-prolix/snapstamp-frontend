import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getRewards, redeemReward } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { RewardCard } from '../../components/shared/RewardCard';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';

export default function RewardsPage() {
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', coords],
    queryFn: () => getRewards(coords ? { lat: coords.lat, lon: coords.lon, radius: 10 } : {}),
  });

  const { mutate: redeem } = useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      toast.success('Reward redeemed! Check your redemptions for the code.');
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setRedeemingId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Redemption failed');
      setRedeemingId(null);
    },
  });

  const enableGeo = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoEnabled(true);
      },
      () => toast.error('Location access denied'),
    );
  };

  const handleRedeem = (rewardId: string) => {
    setRedeemingId(rewardId);
    redeem(rewardId);
  };

  return (
    <AppShell title="Rewards">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {!geoEnabled ? (
            <Button variant="secondary" size="sm" onClick={enableGeo}>
              📍 Use my location
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setGeoEnabled(false); setCoords(null); }}
            >
              ✕ Remove location filter
            </Button>
          )}
          {geoEnabled && <span className="text-xs text-gray-500">Showing rewards within 10 km, sorted by distance</span>}
        </div>

        {isLoading ? <PageSpinner /> : (
          (rewards?.length ?? 0) === 0
            ? <p className="text-gray-400 text-sm">No rewards found.</p>
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards!.map(r => (
                  <RewardCard
                    key={r.id}
                    reward={r}
                    onRedeem={() => handleRedeem(r.id)}
                    isRedeeming={redeemingId === r.id}
                  />
                ))}
              </div>
            )
        )}
      </div>
    </AppShell>
  );
}
