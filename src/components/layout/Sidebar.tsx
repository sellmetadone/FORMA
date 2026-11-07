import {
  LayoutDashboard,
  Layout,
  Palette,
  Image,
  Boxes,
  Paintbrush,
  Grid3x3,
  Users,
  Settings,
  MousePointer2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/core/i18n';
import type { PageId } from '@/types';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { id: PageId; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'overview', labelKey: 'nav.overview', icon: <LayoutDashboard size={18} strokeWidth={1.75} /> },
  { id: 'workspace', labelKey: 'nav.workspace', icon: <Layout size={18} strokeWidth={1.75} /> },
  { id: 'themes', labelKey: 'nav.themes', icon: <Palette size={18} strokeWidth={1.75} /> },
  { id: 'wallpapers', labelKey: 'nav.wallpapers', icon: <Image size={18} strokeWidth={1.75} /> },
  { id: 'widgets', labelKey: 'nav.widgets', icon: <Boxes size={18} strokeWidth={1.75} /> },
  { id: 'appearance', labelKey: 'nav.appearance', icon: <Paintbrush size={18} strokeWidth={1.75} /> },
  { id: 'layouts', labelKey: 'nav.layouts', icon: <Grid3x3 size={18} strokeWidth={1.75} /> },
  { id: 'profiles', labelKey: 'nav.profiles', icon: <Users size={18} strokeWidth={1.75} /> },
  { id: 'icons', labelKey: 'nav.icons', icon: <MousePointer2 size={18} strokeWidth={1.75} /> },
  { id: 'settings', labelKey: 'nav.settings', icon: <Settings size={18} strokeWidth={1.75} /> },
];

export function Sidebar() {
  const currentPage = useAppStore((s) => s.currentPage);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const locale = useAppStore((s) => s.locale);
  const version = useAppStore((s) => s.version);
  const setPage = useAppStore((s) => s.setPage);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  void locale;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        {!collapsed && <span className={styles.logo}>FORMA</span>}
        <button
          className={styles.collapseBtn}
          onClick={toggleSidebar}
          title={collapsed ? 'Expand' : 'Collapse'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
            onClick={() => setPage(item.id)}
            title={t(item.labelKey)}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{t(item.labelKey)}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        {!collapsed && <span className={styles.version}>v{version}</span>}
      </div>
    </aside>
  );
}
