import { useState, useEffect, useRef, ReactNode, ComponentType } from 'react';
import { 
  ChevronDownOutline,
  AddOutline,
  CheckmarkCircleOutline,
  CloudOutline,
  CloseCircleOutline,
  LogOutOutline
} from 'react-ionicons';

interface Workspace {
  id: string;
  name: string;
  slug?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ color?: string; width?: string; height?: string }>;
}

interface SidebarNavProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSwitchWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace?: () => void;
  mainNavItems: NavItem[];
  bottomNavItems?: NavItem[];
  onLogout?: () => void;
  onClose?: () => void;
  isActive: (path: string) => boolean;
  renderLink: (item: NavItem, isActive: boolean, onClick?: () => void) => ReactNode;
  pingStatus?: 'idle' | 'loading' | 'success' | 'error';
  onPing?: () => void;
  translations?: {
    workspaces?: string;
    newWorkspace?: string;
    backend?: string;
    loading?: string;
    connected?: string;
    error?: string;
    logout?: string;
  };
}

const defaultTranslations = {
  workspaces: 'Workspaces',
  newWorkspace: 'Nouveau workspace',
  backend: 'Backend',
  loading: 'Chargement...',
  connected: 'Connecté',
  error: 'Erreur',
  logout: 'Déconnexion',
};

const getInitials = (name: string): string => {
  if (!name || name.trim() === '') return 'W';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export function SidebarNav({
  workspaces,
  currentWorkspace,
  onSwitchWorkspace,
  onCreateWorkspace,
  mainNavItems,
  bottomNavItems = [],
  onLogout,
  onClose,
  isActive,
  renderLink,
  pingStatus = 'idle',
  onPing,
  translations = {},
}: SidebarNavProps) {
  const t = { ...defaultTranslations, ...translations };
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchWorkspace = async (workspace: Workspace) => {
    if (workspace.id === currentWorkspace?.id) {
      setShowWorkspaceMenu(false);
      return;
    }
    setSwitchingWorkspace(true);
    try {
      await onSwitchWorkspace(workspace);
      setShowWorkspaceMenu(false);
    } finally {
      setSwitchingWorkspace(false);
    }
  };

  const getPingIcon = () => {
    switch (pingStatus) {
      case 'loading':
        return <CloudOutline color="currentColor" width="18px" height="18px" />;
      case 'success':
        return <CheckmarkCircleOutline color="#16A34A" width="18px" height="18px" />;
      case 'error':
        return <CloseCircleOutline color="#DC2626" width="18px" height="18px" />;
      default:
        return <CloudOutline color="currentColor" width="18px" height="18px" />;
    }
  };

  const getPingLabel = () => {
    switch (pingStatus) {
      case 'loading': return t.loading;
      case 'success': return t.connected;
      case 'error': return t.error;
      default: return t.backend;
    }
  };

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-nav__header">
        <div className="sidebar-nav__workspace" ref={workspaceMenuRef}>
          <button
            className="sidebar-nav__workspace-btn"
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            disabled={switchingWorkspace}
          >
            <span className="sidebar-nav__workspace-icon">
              {getInitials(currentWorkspace?.name || 'W')}
            </span>
            <span className="sidebar-nav__workspace-name">
              {switchingWorkspace ? t.loading : (currentWorkspace?.name || 'Workspace')}
            </span>
            <ChevronDownOutline
              color="currentColor"
              width="14px"
              height="14px"
              cssClasses={`sidebar-nav__workspace-chevron ${showWorkspaceMenu ? 'is-open' : ''}`}
            />
          </button>

          {showWorkspaceMenu && (
            <div className="sidebar-nav__workspace-menu">
              <div className="sidebar-nav__workspace-menu-header">
                {t.workspaces}
              </div>
              <ul className="sidebar-nav__workspace-list">
                {workspaces.map((workspace) => (
                  <li key={workspace.id}>
                    <button
                      className={`sidebar-nav__workspace-item ${workspace.id === currentWorkspace?.id ? 'is-active' : ''}`}
                      onClick={() => handleSwitchWorkspace(workspace)}
                    >
                      <span className="sidebar-nav__workspace-item-icon">
                        {getInitials(workspace.name)}
                      </span>
                      <span className="sidebar-nav__workspace-item-name">
                        {workspace.name}
                      </span>
                      {workspace.id === currentWorkspace?.id && (
                        <CheckmarkCircleOutline color="#16A34A" width="16px" height="16px" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {onCreateWorkspace && (
                <div className="sidebar-nav__workspace-menu-footer">
                  <button
                    className="sidebar-nav__workspace-add"
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      onCreateWorkspace();
                    }}
                  >
                    <AddOutline color="currentColor" width="16px" height="16px" />
                    <span>{t.newWorkspace}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-nav__content">
        <ul className="sidebar-nav__list">
          {mainNavItems.map((item) => (
            <li key={item.path} className="sidebar-nav__item">
              {renderLink(item, isActive(item.path), onClose)}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-nav__footer">
        <div className="sidebar-nav__divider" />
        
        {onPing && (
          <button 
            className={`sidebar-nav__ping sidebar-nav__ping--${pingStatus}`}
            onClick={onPing}
            disabled={pingStatus === 'loading'}
            title={t.backend}
          >
            <span className="sidebar-nav__ping-icon">{getPingIcon()}</span>
            <span className="sidebar-nav__ping-label">{getPingLabel()}</span>
          </button>
        )}

        <ul className="sidebar-nav__list">
          {bottomNavItems.map((item) => (
            <li key={item.path} className="sidebar-nav__item">
              {renderLink(item, isActive(item.path), onClose)}
            </li>
          ))}
          {onLogout && (
            <li className="sidebar-nav__item">
              <button
                className="sidebar-nav__link sidebar-nav__logout"
                onClick={onLogout}
              >
                <span className="sidebar-nav__icon">
                  <LogOutOutline color="currentColor" width="22px" height="22px" />
                </span>
                <span className="sidebar-nav__label">{t.logout}</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default SidebarNav;
