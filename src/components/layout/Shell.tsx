import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './MainContent';
import styles from './Shell.module.css';

export function Shell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <MainContent />
      </div>
    </div>
  );
}
