import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Gift, CheckCircle, Share2, User,
  PenSquare, Zap, Receipt, Store, BarChart2, CheckSquare, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem { label: string; to: string; icon: React.ElementType }

const customerNav: NavItem[] = [
  { label: 'Dashboard',   to: '/customer',              icon: LayoutDashboard },
  { label: 'Stamp Cards', to: '/customer/stamp-cards',  icon: CreditCard },
  { label: 'Rewards',     to: '/customer/rewards',      icon: Gift },
  { label: 'Redemptions', to: '/customer/redemptions',  icon: CheckCircle },
  { label: 'Referral',    to: '/customer/referral',     icon: Share2 },
  { label: 'Profile',     to: '/customer/profile',      icon: User },
];

const merchantNav: NavItem[] = [
  { label: 'Dashboard',    to: '/merchant',              icon: LayoutDashboard },
  { label: 'Rewards',      to: '/merchant/rewards',      icon: Gift },
  { label: 'Issue Stamps', to: '/merchant/stamps',       icon: PenSquare },
  { label: 'Redemptions',  to: '/merchant/redemptions',  icon: CheckSquare },
  { label: 'Subscription', to: '/merchant/subscription', icon: Zap },
  { label: 'Payments',     to: '/merchant/payments',     icon: Receipt },
  { label: 'Profile',      to: '/merchant/profile',      icon: User },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin',          icon: BarChart2 },
  { label: 'Merchants', to: '/admin/merchants', icon: Store },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { role } = useAuth();
  const navItems = role === 'ROLE_MERCHANT' ? merchantNav
    : role === 'ROLE_ADMIN' ? adminNav
    : customerNav;

  const roleLabel = role === 'ROLE_MERCHANT' ? 'Merchant'
    : role === 'ROLE_ADMIN' ? 'Admin'
    : 'Customer';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-56 shrink-0 flex flex-col
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
        `}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
            >
              <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none">
                <circle cx="16" cy="16" r="13" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2.5" opacity="0.7" />
                <path d="M11.5 16.5l3 3 6-7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>snapstamp</p>
              <p className="text-[10px] mt-0.5 font-medium uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{roleLabel}</p>
            </div>
          </div>
          <button
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split('/').length === 2}
                onClick={onClose}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
                style={({ isActive }) => isActive
                  ? { color: 'var(--accent)', background: 'var(--accent-dim)', borderLeft: '2px solid var(--accent)', paddingLeft: '10px' }
                  : { color: 'var(--text-secondary)', borderLeft: '2px solid transparent' }
                }
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
