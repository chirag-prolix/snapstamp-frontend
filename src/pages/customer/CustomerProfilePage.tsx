import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { requestOtp, verifyOtp } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { CustomerUser } from '../../types/api';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const customer = user as CustomerUser;
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const queryClient = useQueryClient();

  const requestEmail = useMutation({
    mutationFn: () => requestOtp('email'),
    onSuccess: () => toast.success('OTP sent to your email'),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to send OTP'),
  });

  const requestPhone = useMutation({
    mutationFn: () => requestOtp('phone'),
    onSuccess: () => toast.success('OTP sent via SMS'),
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to send OTP'),
  });

  const verifyEmail = useMutation({
    mutationFn: () => verifyOtp('email', emailCode),
    onSuccess: () => {
      toast.success('Email verified!');
      setEmailCode('');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Invalid code'),
  });

  const verifyPhone = useMutation({
    mutationFn: () => verifyOtp('phone', phoneCode),
    onSuccess: () => {
      toast.success('Phone verified!');
      setPhoneCode('');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Invalid code'),
  });

  if (!customer) return null;

  return (
    <AppShell title="Profile">
      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader><p className="font-medium text-gray-700">Account details</p></CardHeader>
          <CardBody className="space-y-3 text-sm">
            <Row label="Name" value={`${customer.firstName} ${customer.lastName}`} />
            <Row label="Email" value={customer.email} />
            <Row label="Phone" value={customer.phone} />
            <Row label="Tier" value={<Badge color="indigo">{customer.tier}</Badge>} />
            <Row label="Referral code" value={<code className="font-mono bg-gray-100 px-2 py-0.5 rounded">{customer.referralCode ?? '—'}</code>} />
            <Row label="Member since" value={new Date(customer.createdAt).toLocaleDateString()} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-medium text-gray-700">Verification</p></CardHeader>
          <CardBody className="space-y-6">
            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <Badge color={customer.isEmailVerified ? 'green' : 'yellow'}>
                  {customer.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              {!customer.isEmailVerified && (
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" isLoading={requestEmail.isPending} onClick={() => requestEmail.mutate()}>
                    Send email OTP
                  </Button>
                  <div className="flex gap-2">
                    <Input placeholder="6-digit code" value={emailCode} onChange={e => setEmailCode(e.target.value)} />
                    <Button size="sm" isLoading={verifyEmail.isPending} onClick={() => verifyEmail.mutate()} disabled={emailCode.length !== 6}>
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <Badge color={customer.isPhoneVerified ? 'green' : 'yellow'}>
                  {customer.isPhoneVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              {!customer.isPhoneVerified && (
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" isLoading={requestPhone.isPending} onClick={() => requestPhone.mutate()}>
                    Send SMS OTP
                  </Button>
                  <div className="flex gap-2">
                    <Input placeholder="6-digit code" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} />
                    <Button size="sm" isLoading={verifyPhone.isPending} onClick={() => verifyPhone.mutate()} disabled={phoneCode.length !== 6}>
                      Verify
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
