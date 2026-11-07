import { useAppStore } from '@/stores/appStore';
import { OverviewPage } from '@/pages/OverviewPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { ThemesPage } from '@/pages/ThemesPage';
import { WallpapersPage } from '@/pages/WallpapersPage';
import { WidgetsPage } from '@/pages/WidgetsPage';
import { AppearancePage } from '@/pages/AppearancePage';
import { LayoutsPage } from '@/pages/LayoutsPage';
import { ProfilesPage } from '@/pages/ProfilesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { IconsPage } from '@/pages/IconsPage';
import styles from './MainContent.module.css';

export function MainContent() {
  const currentPage = useAppStore((s) => s.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'workspace':
        return <WorkspacePage />;
      case 'themes':
        return <ThemesPage />;
      case 'wallpapers':
        return <WallpapersPage />;
      case 'widgets':
        return <WidgetsPage />;
      case 'appearance':
        return <AppearancePage />;
      case 'layouts':
        return <LayoutsPage />;
      case 'profiles':
        return <ProfilesPage />;
      case 'icons':
        return <IconsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return <main className={styles.content}>{renderPage()}</main>;
}
