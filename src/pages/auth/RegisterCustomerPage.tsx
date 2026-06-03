import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerCustomer } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  firstName:    z.string().min(1, 'Required').max(100),
  lastName:     z.string().min(1, 'Required').max(100),
  email:        z.string().email('Invalid email'),
  phone:        z.string().regex(/^\+91\d{10}$/, 'Enter a valid Indian number (e.g. +919876543210)'),
  password:     z.string().min(8, 'Minimum 8 characters'),
  referralCode: z.string().max(20).optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function RegisterCustomerPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const registerPhone = (name: 'phone') => {
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
      const res = await registerCustomer({
        ...data,
        referralCode: data.referralCode || undefined,
      });
      authLogin(res);
      navigate('/customer');
      toast.success('Welcome to snapstamp!');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">snapstamp</h1>
          <p className="text-gray-500 mt-2">Create your customer account</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="Last name" {...register('lastName')} error={errors.lastName?.message} />
            </div>
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Phone" placeholder="+919876543210" maxLength={13} {...registerPhone('phone')} error={errors.phone?.message} />
            <Input label="Password" type="password" showToggle {...register('password')} error={errors.password?.message} />
            <Input label="Referral code (optional)" {...register('referralCode')} error={errors.referralCode?.message} />
            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              Create account
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
