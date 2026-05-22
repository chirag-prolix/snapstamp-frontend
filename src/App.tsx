import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Spinner } from './components/ui/Spinner';
import type { ReactNode } from 'react';
import type { MerchantUser } from './types/api';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterCustomerPage from './pages/auth/RegisterCustomerPage';
import RegisterMerchantPage from './pages/auth/RegisterMerchantPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import StampCardsPage from './pages/customer/StampCardsPage';
import StampCardDetailPage from './pages/customer/StampCardDetailPage';
import RewardsPage from './pages/customer/RewardsPage';
import RedemptionsPage from './pages/customer/RedemptionsPage';
import ReferralPage from './pages/customer/ReferralPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Merchant pages
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantRewardsPage from './pages/merchant/MerchantRewardsPage';
import IssueStampsPage from './pages/merchant/IssueStampsPage';
import MerchantRedemptionsPage from './pages/merchant/MerchantRedemptionsPage';
import MerchantProfilePage from './pages/merchant/MerchantProfilePage';
import SubscriptionPage from './pages/merchant/SubscriptionPage';
import PaymentHistoryPage from './pages/merchant/PaymentHistoryPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMerchantsPage from './pages/admin/AdminMerchantsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RootRedirect() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ROLE_MERCHANT') return <Navigate to="/merchant" replace />;
  if (role === 'ROLE_ADMIN')    return <Navigate to="/admin" replace />;
  return <Navigate to="/customer" replace />;
}

function RequireRole({ role: required, children }: { role: string; children: ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== required) return <RootRedirect />;
  return <>{children}</>;
}

function RequireMerchantAccess({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  if (role !== 'ROLE_MERCHANT') return <>{children}</>;
  if (!(user as MerchantUser).hasActiveAccess) {
    return <Navigate to="/merchant/subscription" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/customer" element={<RegisterCustomerPage />} />
      <Route path="/register/merchant" element={<RegisterMerchantPage />} />

      {/* Customer */}
      <Route path="/customer" element={<RequireRole role="ROLE_CUSTOMER"><CustomerDashboard /></RequireRole>} />
      <Route path="/customer/stamp-cards" element={<RequireRole role="ROLE_CUSTOMER"><StampCardsPage /></RequireRole>} />
      <Route path="/customer/stamp-cards/:id" element={<RequireRole role="ROLE_CUSTOMER"><StampCardDetailPage /></RequireRole>} />
      <Route path="/customer/rewards" element={<RequireRole role="ROLE_CUSTOMER"><RewardsPage /></RequireRole>} />
      <Route path="/customer/redemptions" element={<RequireRole role="ROLE_CUSTOMER"><RedemptionsPage /></RequireRole>} />
      <Route path="/customer/referral" element={<RequireRole role="ROLE_CUSTOMER"><ReferralPage /></RequireRole>} />
      <Route path="/customer/profile" element={<RequireRole role="ROLE_CUSTOMER"><CustomerProfilePage /></RequireRole>} />

      {/* Merchant */}
      <Route path="/merchant" element={<RequireRole role="ROLE_MERCHANT"><RequireMerchantAccess><MerchantDashboard /></RequireMerchantAccess></RequireRole>} />
      <Route path="/merchant/rewards" element={<RequireRole role="ROLE_MERCHANT"><RequireMerchantAccess><MerchantRewardsPage /></RequireMerchantAccess></RequireRole>} />
      <Route path="/merchant/stamps" element={<RequireRole role="ROLE_MERCHANT"><RequireMerchantAccess><IssueStampsPage /></RequireMerchantAccess></RequireRole>} />
      <Route path="/merchant/redemptions" element={<RequireRole role="ROLE_MERCHANT"><RequireMerchantAccess><MerchantRedemptionsPage /></RequireMerchantAccess></RequireRole>} />
      <Route path="/merchant/profile" element={<RequireRole role="ROLE_MERCHANT"><RequireMerchantAccess><MerchantProfilePage /></RequireMerchantAccess></RequireRole>} />
      <Route path="/merchant/subscription" element={<RequireRole role="ROLE_MERCHANT"><SubscriptionPage /></RequireRole>} />
      <Route path="/merchant/payments" element={<RequireRole role="ROLE_MERCHANT"><PaymentHistoryPage /></RequireRole>} />

      {/* Admin */}
      <Route path="/admin" element={<RequireRole role="ROLE_ADMIN"><AdminDashboard /></RequireRole>} />
      <Route path="/admin/merchants" element={<RequireRole role="ROLE_ADMIN"><AdminMerchantsPage /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
