import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Пока пусто', description, action, icon }) {
  return (
    <div className="empty-state">
      {icon || <PackageOpen size={46} />}
      <h3 style={{ margin: '12px 0 8px' }}>{title}</h3>
      {description && <p style={{ maxWidth: 420, margin: '0 auto 20px' }}>{description}</p>}
      {action}
    </div>
  );
}
