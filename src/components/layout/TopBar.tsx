import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logout as apiLogout } from '../../api/auth';
import { Badge, statusColor } from '../ui/Badge';

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ background: 'var(--accent)', color: '#0D0F14' }}
    >
      {letters.toUpperCase()}
    </div>
  );
}

export function TopBar({ title }: { title?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    logout();
    navigate('/login');
  };

  const displayName = user
    ? ('displayName' in user ? user.displayName : (user as any).firstName + ' ' + (user as any).lastName)
    : '';

  const tier = user && 'tier' in user ? (user as any).tier : null;

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h1>

      <div className="flex items-center gap-3">
        {displayName && (
          <div className="hidden sm:flex items-center gap-2.5">
            <Initials name={displayName} />
            <div className="text-right">
              <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              {tier && <Badge color={statusColor(tier)} className="text-[10px]">{tier}</Badge>}
            </div>
          </div>
        )}
        {/* Mobile: just avatar */}
        {displayName && (
          <div className="sm:hidden">
            <Initials name={displayName} />
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
