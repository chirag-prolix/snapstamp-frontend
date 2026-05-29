import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMerchantStats } from '../../api/merchant';
import { useAnalyticsInsights } from '../../hooks/useAi';
import { AppShell } from '../../components/layout/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
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

  const isUrgent = daysLeft <= 7;

  return (
    <div className={`rounded-xl border px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
      isUrgent ? 'border-amber-200 bg-amber-50' : 'border-indigo-200 bg-indigo-50'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{isUrgent ? '⚠️' : '🎁'}</span>
        <p className={`text-sm font-medium ${isUrgent ? 'text-amber-800' : 'text-indigo-800'}`}>
          {isUrgent
            ? <>Your free trial ends in <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>. Subscribe to keep uninterrupted access.</>
            : <>You are on a free trial — <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>. Subscribe anytime to continue after it ends.</>
          }
        </p>
      </div>
      <Link
        to="/merchant/subscription"
        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
          isUrgent ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isUrgent ? 'Subscribe now' : 'View plans'}
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

  const { mutate: fetchInsights, data: insights, isPending: insightsLoading } = useAnalyticsInsights();

  useEffect(() => {
    if (data) fetchInsights(data);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
              </svg>
              <p className="font-medium text-gray-700">AI insights</p>
            </div>
          </CardHeader>
          <CardBody>
            {insightsLoading && (
              <p className="text-sm text-gray-400 animate-pulse">Analysing your data...</p>
            )}
            {insights && !insightsLoading && (
              <ul className="space-y-2">
                {insights.split('\n').filter(Boolean).map((line, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">{line}</li>
                ))}
              </ul>
            )}
            {!insights && !insightsLoading && (
              <p className="text-sm text-gray-400">No insights available yet.</p>
            )}
          </CardBody>
        </Card>

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
