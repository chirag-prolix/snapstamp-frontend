import { useQuery } from '@tanstack/react-query';
import { getStampCards } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { StampCardWidget } from '../../components/shared/StampCardWidget';
import { PageSpinner } from '../../components/ui/Spinner';

export default function StampCardsPage() {
  const { data: cards, isLoading } = useQuery({
    queryKey: ['stampCards'],
    queryFn: getStampCards,
  });

  const grouped = {
    ACTIVE:    cards?.filter(c => c.status === 'ACTIVE')    ?? [],
    COMPLETED: cards?.filter(c => c.status === 'COMPLETED') ?? [],
    EXPIRED:   cards?.filter(c => c.status === 'EXPIRED')   ?? [],
  };

  return (
    <AppShell title="My Stamp Cards">
      {isLoading ? <PageSpinner /> : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([status, items]) =>
            items.length > 0 && (
              <section key={status}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{status}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(card => <StampCardWidget key={card.id} card={card} />)}
                </div>
              </section>
            )
          )}
          {(cards?.length ?? 0) === 0 && (
            <p className="text-gray-400 text-sm">You don't have any stamp cards yet. Visit a merchant to get started!</p>
          )}
        </div>
      )}
    </AppShell>
  );
}
