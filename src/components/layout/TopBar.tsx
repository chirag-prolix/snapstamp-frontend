import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout as apiLogout } from '../../api/auth';
import { Button } from '../ui/Button';
import { Badge, statusColor } from '../ui/Badge';

export function TopBar({ title }: { title?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    logout();
    navigate('/login');
  };

  const displayName = user
    ? ('displayName' in user ? user.displayName : user.firstName + ' ' + user.lastName)
    : '';

  const tier = user && 'tier' in user ? user.tier : null;

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 leading-tight">{displayName}</p>
          {tier && (
            <Badge color={statusColor(tier)} className="text-xs">{tier}</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
