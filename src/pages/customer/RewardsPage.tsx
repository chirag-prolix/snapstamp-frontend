import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getRewards, redeemReward, getStampCards } from '../../api/customer';
import { useRewardRecommendations } from '../../hooks/useAi';
import { useAuth } from '../../contexts/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { RewardCard } from '../../components/shared/RewardCard';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import type { CustomerUser } from '../../types/api';

export default function RewardsPage() {
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const customer = user as CustomerUser | null;

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', coords],
    queryFn: () => getRewards(coords ? { lat: coords.lat, lon: coords.lon, radius: 10 } : {}),
  });

  const { data: stampCards } = useQuery({
    queryKey: ['stampCards'],
    queryFn: getStampCards,
  });

  const {
    mutate: fetchRecommendations,
    data: recommendations,
    isPending: recommendationsLoading,
  } = useRewardRecommendations();

  useEffect(() => {
    if (rewards?.length && stampCards && customer?.tier) {
      fetchRecommendations({
        stampCards,
        availableRewards: rewards,
        tier: customer.tier,
      });
    }
  }, [rewards, stampCards]); // eslint-disable-line react-hooks/exhaustive-deps

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

        {/* AI For You section */}
        {(recommendationsLoading || (recommendations && recommendations.length > 0)) && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
              </svg>
              For you
            </h2>
            {recommendationsLoading ? (
              <p className="text-sm text-gray-400 animate-pulse">Finding your best rewards...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations!.map((rec) => {
                  const reward = rewards?.find((r) => r.id === rec.rewardId);
                  if (!reward) return null;
                  return (
                    <div key={rec.rewardId} className="space-y-1.5">
                      <RewardCard
                        reward={reward}
                        onRedeem={() => handleRedeem(reward.id)}
                        isRedeeming={redeemingId === reward.id}
                      />
                      <p className="text-xs text-indigo-600 px-1">{rec.reason}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {isLoading ? <PageSpinner /> : (
          (rewards?.length ?? 0) === 0
            ? <p className="text-gray-400 text-sm">No rewards found.</p>
            : (
              <>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All rewards</h2>
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
              </>
            )
        )}
      </div>
    </AppShell>
  );
}
