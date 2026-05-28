import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { issueStamps } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { StampCardDetail } from '../../types/api';

const today = new Date().toISOString().split('T')[0];

const schema = z.object({
  lookupType:     z.enum(['phone', 'customerId']),
  phone:          z.string().optional(),
  customerId:     z.string().optional(),
  count:          z.coerce.number().int().min(1, 'Min 1').max(10, 'Max 10'),
  notes:          z.string().max(500).optional(),
  isBonus:        z.boolean().optional(),
  cardExpiresAt:  z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.lookupType === 'phone') {
    if (!d.phone || !/^\+91[0-9]{10}$/.test(d.phone)) {
      ctx.addIssue({ code: "custom", message: 'Enter a valid 10-digit mobile number', path: ['phone'] });
    }
  } else {
    if (!d.customerId) {
      ctx.addIssue({ code: "custom", message: 'Customer identifier required', path: ['customerId'] });
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.customerId)) {
      ctx.addIssue({ code: "custom", message: 'Invalid UUID', path: ['customerId'] });
    }
  }
}).refine(d => !d.cardExpiresAt || d.cardExpiresAt >= today, {
  message: 'Expiry date must be in the future',
  path: ['cardExpiresAt'],
});

type FormData = {
  lookupType: 'phone' | 'customerId';
  phone?: string;
  customerId?: string;
  count: number;
  notes?: string;
  isBonus?: boolean;
  cardExpiresAt?: string;
};

function QrScannerModal({ onClose, onScan }: {
  onClose: () => void;
  onScan: (phone: string) => void;
}) {
  const [mode, setMode] = useState<'camera' | 'file'>('camera');
  const [error, setError] = useState<string | null>(null);
  const didScan = useRef(false);
  const stopRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (mode !== 'camera') return;
    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode('qr-reader');
      stopRef.current = () => scanner.stop();

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (text) => {
          if (didScan.current) return;
          didScan.current = true;
          const phone = text.startsWith('+') ? text : `+91${text.replace(/\D/g, '')}`;
          scanner.stop().catch(() => {});
          onScan(phone);
        },
        () => {},
      ).catch(() => setError('Camera access denied. Please allow camera permissions and try again.'));
    });

    return () => {
      cancelled = true;
      stopRef.current?.().catch(() => {});
    };
  }, [mode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const { default: jsQR } = await import('jsqr');
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(data, width, height);
      if (!result) throw new Error('No QR found');
      const text = result.data;
      const phone = text.startsWith('+') ? text : `+91${text.replace(/\D/g, '')}`;
      onScan(phone);
    } catch {
      setError('Could not read QR code from image. Try a clearer screenshot.');
    }
  };

  const switchMode = (next: 'camera' | 'file') => {
    stopRef.current?.().catch(() => {});
    stopRef.current = null;
    didScan.current = false;
    setError(null);
    setMode(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Scan Customer QR</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer">×</button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-gray-100">
          {(['camera', 'file'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors
                ${mode === m ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {m === 'camera' ? '📷 Camera' : '🖼️ Upload image'}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mode === 'camera' ? (
            <>
              {error
                ? <p className="text-sm text-red-500 text-center py-6">{error}</p>
                : <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
              }
              <p className="text-xs text-gray-400 text-center mt-3">Point the camera at the customer's QR code</p>
            </>
          ) : (
            <>
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-indigo-400 transition-colors">
                <span className="text-3xl">📂</span>
                <span className="text-sm text-gray-500 text-center">
                  Screenshot the customer's QR code and upload it here
                </span>
                <span className="text-xs text-indigo-600 font-medium">Choose file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
              {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}
              <p className="text-xs text-gray-400 text-center mt-3">
                Works great for testing on the same computer
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StampCardPreview({ detail }: { detail: StampCardDetail }) {
  const { stampCard } = detail;
  const total = stampCard.totalSlotsRequired;
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-indigo-600 px-5 py-4 text-white">
        <p className="text-sm opacity-75">{stampCard.displayName ?? 'Stamp Card'}</p>
        <p className="text-2xl font-bold mt-1">
          {stampCard.currentStampCount} of {total} Stamps
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${Math.min(100, (stampCard.currentStampCount / total) * 100)}%` }}
          />
        </div>
      </div>
      <div className="bg-white p-5">
        <div className="grid grid-cols-5 gap-3 mb-4">
          {Array.from({ length: total }, (_, i) => {
            const filled = i < stampCard.currentStampCount;
            return (
              <div
                key={i}
                className={`aspect-square rounded-full border-2 flex items-center justify-center text-base
                  ${filled ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 bg-gray-50'}`}
              >
                {filled ? '⭐' : <span className="text-gray-300 text-xs">{i + 1}</span>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 font-mono">{stampCard.cardNumber}</p>
        {stampCard.status === 'COMPLETED' && (
          <p className="text-sm text-green-600 font-medium mt-3">
            🎉 Card completed! Customer can now redeem a reward.
          </p>
        )}
      </div>
    </div>
  );
}

export default function IssueStampsPage() {
  const [result, setResult] = useState<StampCardDetail | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: { lookupType: 'phone', count: 1, isBonus: false },
  });

  const lookupType = useWatch({ control, name: 'lookupType' });

  const { mutate: issue } = useMutation({
    mutationFn: (data: FormData) => issueStamps({
      count: data.count,
      notes: data.notes,
      isBonus: data.isBonus,
      cardExpiresAt: data.cardExpiresAt || undefined,
      ...(data.lookupType === 'phone'
        ? { customerPhone: data.phone }
        : { customerId: data.customerId }),
    }),
    onSuccess: (data) => {
      setResult(data);
      toast.success(`${data.stamps.length} stamp(s) issued!`);
      reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to issue stamps'),
  });

  return (
    <AppShell title="Issue Stamps">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Left: form */}
        <Card>
          <CardHeader><p className="font-medium text-gray-700">Issue stamps to customer</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(d => issue(d))} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Find customer by</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="phone" {...register('lookupType')} /> Phone
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" value="customerId" {...register('lookupType')} /> Customer ID
                  </label>
                </div>
              </div>

              {lookupType === 'phone' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Phone number</label>
                  <div className="flex gap-2">
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <div className={`flex flex-1 items-center rounded-lg border transition focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}>
                          <span className="pl-3 pr-2 text-sm text-gray-500 select-none border-r border-gray-300 py-2 font-medium whitespace-nowrap">+91</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="98765 43210"
                            value={field.value ? field.value.replace(/^\+91/, '') : ''}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                              field.onChange(digits ? `+91${digits}` : '');
                            }}
                            className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent rounded-r-lg"
                          />
                          {field.value && field.value.replace(/^\+91/, '').length > 0 && (
                            <span className={`pr-3 text-xs font-medium ${field.value.replace(/^\+91/, '').length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                              {field.value.replace(/^\+91/, '').length}/10
                            </span>
                          )}
                        </div>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      title="Scan customer QR code"
                      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5A1.5 1.5 0 014.5 3h3A1.5 1.5 0 019 4.5v3A1.5 1.5 0 017.5 9h-3A1.5 1.5 0 013 7.5v-3zM15 4.5A1.5 1.5 0 0116.5 3h3A1.5 1.5 0 0121 4.5v3A1.5 1.5 0 0119.5 9h-3A1.5 1.5 0 0115 7.5v-3zM3 16.5A1.5 1.5 0 014.5 15h3A1.5 1.5 0 019 16.5v3A1.5 1.5 0 017.5 21h-3A1.5 1.5 0 013 19.5v-3zM15 16.5a1.5 1.5 0 011.5-1.5h.75M21 15h-.75M21 21h-6M15 21v-3.75M21 18h-3" />
                      </svg>
                    </button>
                  </div>
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
              ) : (
                <Input label="Customer UUID" {...register('customerId')} error={errors.customerId?.message} />
              )}

              <Input label="Number of stamps (1–10)" type="number" min={1} max={10} {...register('count')} error={errors.count?.message} />
              <Input label="Notes (optional)" {...register('notes')} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" {...register('isBonus')} />
                Mark as bonus stamps
              </label>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Card expiry date <span className="text-gray-400 font-normal">(optional — default 1 year)</span>
                </label>
                <input
                  type="date"
                  min={today}
                  {...register('cardExpiresAt')}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.cardExpiresAt && (
                  <p className="text-xs text-red-600">{errors.cardExpiresAt.message}</p>
                )}
                <p className="text-xs text-gray-400">Sets or updates the expiry date on this customer's stamp card.</p>
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full">Issue stamps</Button>
            </form>
          </CardBody>
        </Card>

        {/* Right: stamp card preview */}
        <div className="flex flex-col justify-start">
          {result ? (
            <StampCardPreview detail={result} />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-64 gap-2 text-gray-400">
              <span className="text-3xl">📮</span>
              <p className="text-sm">Stamp card preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <QrScannerModal
          onClose={() => setShowScanner(false)}
          onScan={(phone) => {
            setValue('phone', phone, { shouldValidate: true });
            setValue('lookupType', 'phone');
            setShowScanner(false);
            toast.success('Phone number scanned!');
          }}
        />
      )}
    </AppShell>
  );
}
