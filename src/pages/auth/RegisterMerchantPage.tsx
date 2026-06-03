import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerMerchant } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName:              z.string().min(1, 'Required'),
  lastName:               z.string().min(1, 'Required'),
  email:                  z.string().email('Invalid email'),
  phone:                  z.string().regex(/^\+91\d{10}$/, 'Enter a valid Indian number (e.g. +919876543210)'),
  password:               z.string().min(8, 'Minimum 8 characters'),
  businessName:           z.string().min(1, 'Required'),
  city:                   z.string().min(1, 'Required'),
  state:                  z.string().min(1, 'Required'),
  address:                z.string().min(1, 'Required'),
  phoneForBusiness:       z.string().regex(/^\+91\d{10}$/, 'Enter a valid Indian number (e.g. +919876543210)'),
  taxId:                  z.string().min(1, 'Required'),
  bankAccountNumber:      z.string().min(1, 'Required'),
  bankIfscCode:           z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (e.g. HDFC0001234)'),
  bankAccountHolderName:  z.string().min(1, 'Required'),
  termsAccepted:          z.literal(true, 'You must accept the terms'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterMerchantPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const registerPhone = (name: 'phone' | 'phoneForBusiness') => {
    const { onChange, ...rest } = register(name);
    return {
      ...rest,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = e.target.value.replace(/[^\d+]/g, '');
        return onChange(e);
      },
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      await registerMerchant(data);
      toast.success('Registration submitted! Your account is pending admin approval.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">snapstamp</h1>
          <p className="text-gray-500 mt-2">Merchant registration</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Personal details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
                <Input label="Last name"  {...register('lastName')} error={errors.lastName?.message} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                <Input label="Phone" placeholder="+919876543210" maxLength={13} {...registerPhone('phone')} error={errors.phone?.message} />
              </div>
              <div className="mt-4">
                <Input label="Password" type="password" showToggle {...register('password')} error={errors.password?.message} />
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Business details</h2>
              <div className="space-y-4">
                <Input label="Business name" {...register('businessName')} error={errors.businessName?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" {...register('city')} error={errors.city?.message} />
                  <Input label="State" {...register('state')} error={errors.state?.message} />
                </div>
                <Input label="Address" {...register('address')} error={errors.address?.message} />
                <Input label="Business phone" placeholder="+919876543210" maxLength={13} {...registerPhone('phoneForBusiness')} error={errors.phoneForBusiness?.message} />
                <Input label="Tax ID / GST" {...register('taxId')} error={errors.taxId?.message} />
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Bank details</h2>
              <div className="space-y-4">
                <Input label="Account holder name" {...register('bankAccountHolderName')} error={errors.bankAccountHolderName?.message} />
                <Input label="Account number" {...register('bankAccountNumber')} error={errors.bankAccountNumber?.message} />
                <Input label="IFSC code" placeholder="HDFC0001234" {...register('bankIfscCode')} error={errors.bankIfscCode?.message} />
              </div>
            </section>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" {...register('termsAccepted')} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I accept the terms and conditions and confirm all details are accurate.
              </label>
            </div>
            {errors.termsAccepted && <p className="text-xs text-red-600">{errors.termsAccepted.message}</p>}

            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              Submit registration
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
