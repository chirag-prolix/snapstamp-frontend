import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStampCards, getRewards, getReferralStats } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { StampCardWidget } from '../../components/shared/StampCardWidget';
import { RewardCard } from '../../components/shared/RewardCard';
import { StatCard } from '../../components/shared/StatCard';
import { PageSpinner } from '../../components/ui/Spinner';
import type { CustomerUser } from '../../types/api';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const customer = user as CustomerUser;

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['stampCards'],
    queryFn: getStampCards,
  });

  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards', {}],
    queryFn: () => getRewards(),
  });

  const { data: referralStats } = useQuery({
    queryKey: ['referralStats'],
    queryFn: getReferralStats,
  });

  const activeCards = cards?.filter(c => c.status === 'ACTIVE') ?? [];
  const totalStamps = cards?.reduce((s, c) => s + c.currentStampCount, 0) ?? 0;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Cards" value={activeCards.length} icon="📇" />
          <StatCard label="Total Stamps" value={totalStamps} icon="⭐" />
          <StatCard label="Tier" value={customer?.tier ?? '—'} icon="🏅" />
          <StatCard label="Referrals" value={referralStats?.referralCount ?? 0} icon="🔗" />
        </div>

        {/* Active stamp cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Your stamp cards</h2>
            <Link to="/customer/stamp-cards" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          {cardsLoading ? <PageSpinner /> : (
            activeCards.length === 0
              ? <p className="text-sm text-gray-400">No active stamp cards yet.</p>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCards.slice(0, 3).map(card => (
                    <StampCardWidget key={card.id} card={card} />
                  ))}
                </div>
              )
          )}
        </section>

        {/* Rewards nearby */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Available rewards</h2>
            <Link to="/customer/rewards" className="text-sm text-indigo-600 hover:underline">Browse all</Link>
          </div>
          {rewardsLoading ? <PageSpinner /> : (
            (rewards?.length ?? 0) === 0
              ? <p className="text-sm text-gray-400">No rewards available right now.</p>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards!.slice(0, 3).map(r => <RewardCard key={r.id} reward={r} />)}
                </div>
              )
          )}
        </section>
      </div>
    </AppShell>
  );
}
