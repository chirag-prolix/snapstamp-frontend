import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { getMerchantProfile, updateMerchantProfile } from '../../api/merchant';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

type FormData = {
  businessDescription: string;
  city: string;
  state: string;
  address: string;
  postalCode: string;
  phoneForBusiness: string;
  website: string;
  webhookUrl: string;
};

export default function MerchantProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['merchantProfile'],
    queryFn: getMerchantProfile,
  });

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (profile) reset({
      businessDescription: profile.businessDescription ?? '',
      city: profile.city,
      state: profile.state,
      address: profile.address,
      postalCode: profile.postalCode ?? '',
      phoneForBusiness: profile.phoneForBusiness,
      website: profile.website ?? '',
      webhookUrl: (profile as any).webhookUrl ?? '',
    });
  }, [profile, reset]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: updateMerchantProfile,
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['merchantProfile'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  });

  if (isLoading) return <AppShell title="Profile"><PageSpinner /></AppShell>;

  return (
    <AppShell title="Merchant Profile">
      <div className="max-w-2xl space-y-6">
        {/* Read-only info */}
        <Card>
          <CardHeader><p className="font-medium text-gray-700">Business overview</p></CardHeader>
          <CardBody className="space-y-3 text-sm">
            <Row label="Business name" value={profile?.businessName} />
            <Row label="Tax ID" value={profile?.taxId} />
            <Row label="API key" value={<code className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{profile?.apiKey}</code>} />
            <Row label="Status" value={
              <Badge color={profile?.isVerified ? 'green' : 'yellow'}>
                {profile?.onboardingStatus}
              </Badge>
            } />
          </CardBody>
        </Card>

        {/* Editable form */}
        <Card>
          <CardHeader><p className="font-medium text-gray-700">Edit details</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(d => save(d))} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Business description</label>
                <textarea
                  {...register('businessDescription')}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" {...register('city')} />
                <Input label="State" {...register('state')} />
              </div>
              <Input label="Address" {...register('address')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Postal code" {...register('postalCode')} />
                <Input label="Business phone" {...register('phoneForBusiness')} />
              </div>
              <Input label="Website" type="url" {...register('website')} placeholder="https://" />
              <Input label="Webhook URL" type="url" {...register('webhookUrl')} placeholder="https://" />
              <div className="flex justify-end">
                <Button type="submit" isLoading={isPending}>Save changes</Button>
              </div>
            </form>
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
