import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { getStampCards } from '../../api/customer';
import { AppShell } from '../../components/layout/AppShell';
import { StampCardWidget } from '../../components/shared/StampCardWidget';
import { Modal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import type { CustomerUser } from '../../types/api';

export default function StampCardsPage() {
  const [showCode, setShowCode] = useState(false);
  const { user } = useAuth();
  const phone = (user as CustomerUser)?.phone;

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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Collect stamps at participating merchants.</p>
        <button
          onClick={() => setShowCode(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <span>📲</span> Get Stamps
        </button>
      </div>

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

      <Modal isOpen={showCode} onClose={() => setShowCode(false)} title="Get Stamps" size="sm">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <p className="text-sm text-gray-500">
            Show this to the merchant to collect stamps after your visit.
          </p>
          {phone ? (
            <>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <QRCodeSVG value={phone} size={180} />
              </div>
              <p className="text-xl font-mono font-semibold tracking-widest text-gray-800">{phone}</p>
            </>
          ) : (
            <p className="text-sm text-red-500">
              No phone number linked to your account. Please update your profile.
            </p>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
