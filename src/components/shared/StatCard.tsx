import { Card, CardBody } from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
}

export function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
      </CardBody>
    </Card>
  );
}
