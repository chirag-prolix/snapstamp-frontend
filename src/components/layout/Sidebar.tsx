import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem { label: string; to: string; icon: string }

const customerNav: NavItem[] = [
  { label: 'Dashboard',   to: '/customer',              icon: '🏠' },
  { label: 'Stamp Cards', to: '/customer/stamp-cards',  icon: '📇' },
  { label: 'Rewards',     to: '/customer/rewards',      icon: '🎁' },
  { label: 'Redemptions', to: '/customer/redemptions',  icon: '🎟️' },
  { label: 'Referral',    to: '/customer/referral',     icon: '🔗' },
  { label: 'Profile',     to: '/customer/profile',      icon: '👤' },
];

const merchantNav: NavItem[] = [
  { label: 'Dashboard',   to: '/merchant',              icon: '📊' },
  { label: 'Rewards',     to: '/merchant/rewards',      icon: '🎁' },
  { label: 'Issue Stamps',to: '/merchant/stamps',       icon: '📮' },
  { label: 'Redemptions', to: '/merchant/redemptions',  icon: '✅' },
  { label: 'Subscription',to: '/merchant/subscription', icon: '💳' },
  { label: 'Payments',    to: '/merchant/payments',     icon: '🧾' },
  { label: 'Profile',     to: '/merchant/profile',      icon: '🏪' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',   to: '/admin',                 icon: '📊' },
  { label: 'Merchants',   to: '/admin/merchants',       icon: '🏬' },
];

export function Sidebar() {
  const { role } = useAuth();
  const navItems = role === 'ROLE_MERCHANT' ? merchantNav
    : role === 'ROLE_ADMIN' ? adminNav
    : customerNav;

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-indigo-600">snapstamp</span>
        <span className="ml-2 text-xs text-gray-400 uppercase tracking-wide">
          {role === 'ROLE_MERCHANT' ? 'Merchant' : role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
               ${isActive
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
