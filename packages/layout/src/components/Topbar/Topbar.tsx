import { ReactNode } from 'react';
import { MenuOutline, NotificationsOutline, FlashOutline } from 'react-ionicons';

interface TopbarProps {
  onMenuClick?: () => void;
  onAICoachClick?: () => void;
  isAICoachOpen?: boolean;
  aiCoachLabel?: string;
  aiCoachOpenLabel?: string;
  rightContent?: ReactNode;
}

export function Topbar({ 
  onMenuClick, 
  onAICoachClick,
  isAICoachOpen = false,
  aiCoachLabel = 'Parler au Coach IA',
  aiCoachOpenLabel = 'Fermer le Coach',
  rightContent
}: TopbarProps) {
  return (
    <div className="topbar">
      <div className="topbar__left">
        <button 
          className="topbar__menu-btn" 
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <MenuOutline color="currentColor" width="24px" height="24px" />
        </button>
      </div>

      <div className="topbar__center">
        {onAICoachClick && (
          <button 
            className={`topbar__ai-cta ${isAICoachOpen ? 'is-active' : ''}`}
            onClick={onAICoachClick}
          >
            <span className="topbar__ai-cta-icon">
              <FlashOutline color="currentColor" width="20px" height="20px" />
            </span>
            <span className="topbar__ai-cta-text">
              {isAICoachOpen ? aiCoachOpenLabel : aiCoachLabel}
            </span>
            <span className="topbar__ai-cta-shortcut">⌘K</span>
          </button>
        )}
      </div>

      <div className="topbar__right">
        {rightContent || (
          <button className="topbar__action-btn" aria-label="Notifications">
            <NotificationsOutline color="currentColor" width="22px" height="22px" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Topbar;
