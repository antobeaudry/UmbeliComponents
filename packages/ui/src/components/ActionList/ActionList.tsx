import { Icon } from '@umbeli/ui';
import { CheckmarkOutline, EllipseOutline, RadioButtonOffOutline } from 'react-ionicons';

interface ActionItem {
  id: string | number;
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  date?: string;
  icon?: string;
}

interface ActionListProps {
  items: ActionItem[];
  onItemClick?: (item: ActionItem) => void;
  emptyMessage?: string;
}

export function ActionList({ items, onItemClick, emptyMessage = 'Aucune action' }: ActionListProps) {
  if (items.length === 0) {
    return (
      <div className="action-list action-list--empty">
        <p className="action-list__empty-message">{emptyMessage}</p>
      </div>
    );
  }

  const getStatusClass = (status?: string) => {
    if (!status) return '';
    return `action-list__item--${status}`;
  };

  const renderStatusIcon = (status?: string) => {
    const props = { color: 'currentColor', width: '16px', height: '16px' };
    if (status === 'completed') return <CheckmarkOutline {...props} />;
    if (status === 'in-progress') return <EllipseOutline {...props} />;
    return <RadioButtonOffOutline {...props} />;
  };

  return (
    <ul className="action-list">
      {items.map((item) => (
        <li 
          key={item.id} 
          className={`action-list__item ${getStatusClass(item.status)}`}
          onClick={() => onItemClick?.(item)}
        >
          {item.icon && <span className="action-list__icon"><Icon name={item.icon} size={18} /></span>}
          <div className="action-list__content">
            <span className="action-list__title">{item.title}</span>
            {item.description && (
              <span className="action-list__description">{item.description}</span>
            )}
          </div>
          {item.date && <span className="action-list__date">{item.date}</span>}
          {item.status && (
            <span className={`action-list__status action-list__status--${item.status}`}>
              {renderStatusIcon(item.status)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default ActionList;
