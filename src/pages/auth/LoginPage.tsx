import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.password);
      authLogin(res);
      const r = res.user.roles[0];
      if (r === 'ROLE_MERCHANT') navigate('/merchant');
      else if (r === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/customer');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">snapstamp</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            New customer?{' '}
            <Link to="/register/customer" className="text-indigo-600 font-medium hover:underline">
              Register here
            </Link>
            {' · '}
            <Link to="/register/merchant" className="text-indigo-600 font-medium hover:underline">
              Merchant signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
