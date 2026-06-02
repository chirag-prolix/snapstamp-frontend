import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PenSquare, Gift, Users, Star, CheckCircle, Activity } from 'lucide-react';
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
    <div
      className="rounded-xl border px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={isUrgent
        ? { borderColor: 'var(--danger)', background: 'var(--danger-dim)' }
        : { borderColor: 'var(--accent)', background: 'var(--accent-dim)' }
      }
    >
      <div className="flex items-center gap-3">
        <span className="text-base">{isUrgent ? '⚠️' : '🎁'}</span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {isUrgent
            ? <>Your free trial ends in <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>. Subscribe to keep uninterrupted access.</>
            : <>You are on a free trial — <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>. Subscribe anytime to continue after it ends.</>
          }
        </p>
      </div>
      <Link
        to="/merchant/subscription"
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
        style={isUrgent
          ? { background: 'var(--danger)', color: '#fff' }
          : { background: 'var(--accent)', color: '#0D0F14' }
        }
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
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>All time</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Stamps issued"    value={data?.totals.stampsIssued ?? 0}   icon={PenSquare} />
            <StatCard label="Rewards redeemed" value={data?.totals.rewardsRedeemed ?? 0} icon={Gift} />
            <StatCard label="Total customers"  value={data?.totals.customers ?? 0}       icon={Users} />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Last 30 days</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Stamps issued"    value={data?.last30Days.stampsIssued ?? 0}     icon={Star} />
            <StatCard label="Redemptions"      value={data?.last30Days.redemptions ?? 0}      icon={CheckCircle} />
            <StatCard label="Active customers" value={data?.last30Days.activeCustomers ?? 0}  icon={Activity} />
          </div>
        </section>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
              </svg>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AI insights</p>
            </div>
          </CardHeader>
          <CardBody>
            {insightsLoading && (
              <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>Analysing your data...</p>
            )}
            {insights && !insightsLoading && (
              <ul className="space-y-2">
                {insights.split('\n').filter(Boolean).map((line, i) => (
                  <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{line}</li>
                ))}
              </ul>
            )}
            {!insights && !insightsLoading && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No insights available yet.</p>
            )}
          </CardBody>
        </Card>

        {(data?.topRewards?.length ?? 0) > 0 && (
          <Card>
            <CardHeader><p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Top rewards</p></CardHeader>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {data!.topRewards.map((r, i) => (
                <div key={r.id} className="px-6 py-3 flex items-center gap-4">
                  <span className="text-sm w-5 font-medium" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                  <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.redemptions} redemptions</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
