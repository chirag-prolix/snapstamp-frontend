import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { requestPhoneLoginOtp, verifyPhoneLoginOtp, googleLogin } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  console.log('I\'m here');
  const { login: authLogin } = useAuth();
  console.log('auth', authLogin);
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { setPhoneError('Phone number is required'); return; }
    if (!/^\+?[1-9]\d{7,14}$/.test(trimmed)) { setPhoneError('Enter a valid phone number'); return; }
    setPhoneError('');
    setIsLoading(true);
    try {
      await requestPhoneLoginOtp(trimmed);
      setStep('otp');
      setResendSeconds(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      toast.success('OTP sent to your phone');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to send OTP';
      setPhoneError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setOtpError('Enter the 6-digit OTP'); return; }
    setOtpError('');
    setIsLoading(true);
    try {
      const res = await verifyPhoneLoginOtp(phone.trim(), code);
      authLogin(res);
      const r = res.user.roles[0];
      if (r === 'ROLE_MERCHANT') navigate('/merchant');
      else if (r === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/customer');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid OTP';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setIsLoading(true);
    try {
      await requestPhoneLoginOtp(phone.trim());
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setResendSeconds(30);
      otpRefs.current[0]?.focus();
      toast.success('OTP resent');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: '#F59E0B' }} />

      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
          >
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              <circle cx="16" cy="16" r="13" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2.5" opacity="0.7" />
              <path d="M11.5 16.5l3 3 6-7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>snapstamp</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Your loyalty rewards platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right, #F59E0B, #D97706, #92400E)' }} />

          <div className="p-8">
            {step === 'phone' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Enter your mobile number to receive an OTP</p>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                      Mobile number
                    </label>
                    <div
                      className="flex items-center rounded-lg border transition-all focus-within:ring-2"
                      style={{
                        background: 'var(--bg-elevated)',
                        borderColor: phoneError ? 'var(--danger)' : 'var(--border)',
                        outlineColor: 'var(--accent)',
                      }}
                    >
                      <span
                        className="pl-3 pr-2 text-sm select-none border-r py-2.5 font-semibold"
                        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                      >+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={phone.startsWith('+91') ? phone.slice(3) : phone}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(raw ? `+91${raw}` : '');
                        }}
                        className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent rounded-r-lg"
                        style={{ color: 'var(--text-primary)' }}
                        autoFocus
                      />
                    </div>
                    {phoneError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{phoneError}</p>}
                  </div>

                  <div className="pt-1">
                    <Button type="submit" isLoading={isLoading} size="lg" className="w-full hover:scale-[1.01] active:scale-[0.99]">
                      Send OTP
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setOtpError(''); }}
                    className="flex items-center gap-1.5 text-sm mb-4 font-medium hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--accent)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Change number
                  </button>
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Enter OTP</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Sent to <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{phone}</span>
                  </p>
                </div>

                <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all"
                          style={{
                            background: 'var(--bg-elevated)',
                            borderColor: otpError ? 'var(--danger)' : digit ? 'var(--accent)' : 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{otpError}</p>}
                  </div>

                  <Button type="submit" isLoading={isLoading} size="lg" className="w-full hover:scale-[1.01] active:scale-[0.99]">
                    Verify & Sign in
                  </Button>

                  <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Didn't receive it?{' '}
                    {resendSeconds > 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>Resend in {resendSeconds}s</span>
                    ) : (
                      <button type="button" onClick={handleResend} className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                        Resend OTP
                      </button>
                    )}
                  </p>
                </form>
              </>
            )}

            {step === 'phone' && (
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or continue with</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <div className="mt-4 flex justify-center">
                  <GoogleLogin
                    onSuccess={async ({ credential }) => {
                      if (!credential) return;
                      try {
                        const res = await googleLogin(credential);
                        authLogin(res);
                        if (!res.user.phone) { navigate('/complete-profile'); return; }
                        const r = res.user.roles[0];
                        if (r === 'ROLE_MERCHANT') navigate('/merchant');
                        else if (r === 'ROLE_ADMIN') navigate('/admin');
                        else navigate('/customer');
                      } catch (err) {
                        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                        toast.error(msg ?? 'Google sign-in failed');
                      }
                    }}
                    onError={() => toast.error('Google sign-in failed')}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    width="320"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                New customer?{' '}
                <Link to="/register/customer" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                  Register here
                </Link>
                <span className="mx-2" style={{ color: 'var(--text-muted)' }}>·</span>
                <Link to="/register/merchant" className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                  Merchant signup
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          © 2025 Snapstamp · All rights reserved
        </p>
      </div>
    </div>
  );
}
