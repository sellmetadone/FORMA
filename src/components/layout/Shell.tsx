import { useEffect, useState } from 'react';
import { Onboarding, needsOnboarding } from '@/components/onboarding/Onboarding';
import { CommandPalette } from '@/components/command/CommandPalette';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './MainContent';
import styles from './Shell.module.css';

export function Shell() {
  const [showOnboarding, setShowOnboarding] = useState(() => needsOnboarding());

  useEffect(() => {
    const done = () => setShowOnboarding(false);
    window.addEventListener('forma:onboarding-done', done);
    return () => window.removeEventListener('forma:onboarding-done', done);
  }, []);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <MainContent />
      </div>
      <CommandPalette />
      <GlobalSearch />
      {showOnboarding && <Onboarding />}
    </div>
  );
}
