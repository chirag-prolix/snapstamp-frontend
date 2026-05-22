import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMerchantStats } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import type { MerchantUser } from '../../types/api';

function TrialBanner({ merchant }: { merchant: MerchantUser }) {
  const [now] = useState(Date.now);
  const trialEndsAt = new Date(merchant.trialEndsAt);
  const daysLeft = Math.ceil((trialEndsAt.getTime() - now) / 86_400_000);
  const inTrial = daysLeft > 0;

  if (!inTrial || merchant.subscriptionExpiresAt) return null;
  if (daysLeft > 7) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-800 font-medium">
        Your free trial ends in <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>. Subscribe to keep uninterrupted access.
      </p>
      <Link
        to="/merchant/subscription"
        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
      >
        Subscribe now
      </Link>
    </div>
  );
}

export default function MerchantDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['merchantStats'],
    queryFn: getMerchantStats,
  });
  const { user } = useAuth();
  const merchant = user as MerchantUser;

  if (isLoading) return <AppShell title="Dashboard"><PageSpinner /></AppShell>;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <TrialBanner merchant={merchant} />
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All time</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Stamps issued" value={data?.totals.stampsIssued ?? 0} icon="📮" />
            <StatCard label="Rewards redeemed" value={data?.totals.rewardsRedeemed ?? 0} icon="🎁" />
            <StatCard label="Total customers" value={data?.totals.customers ?? 0} icon="👥" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Last 30 days</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Stamps issued" value={data?.last30Days.stampsIssued ?? 0} icon="⭐" />
            <StatCard label="Redemptions" value={data?.last30Days.redemptions ?? 0} icon="✅" />
            <StatCard label="Active customers" value={data?.last30Days.activeCustomers ?? 0} icon="🙋" />
          </div>
        </section>

        {(data?.topRewards?.length ?? 0) > 0 && (
          <Card>
            <CardHeader><p className="font-medium text-gray-700">Top rewards</p></CardHeader>
            <div className="divide-y divide-gray-100">
              {data!.topRewards.map((r, i) => (
                <div key={r.id} className="px-6 py-3 flex items-center gap-4">
                  <span className="text-gray-400 text-sm w-5">{i + 1}.</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{r.title}</span>
                  <span className="text-sm text-gray-500">{r.redemptions} redemptions</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
