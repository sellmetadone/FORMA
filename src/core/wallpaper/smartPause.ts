import type { PerformancePolicy, SmartPauseState } from './types';
import { DEFAULT_PERFORMANCE } from './types';

type Listener = (state: SmartPauseState) => void;

/**
 * SmartPause — pause animated wallpapers when app is blurred/hidden or on battery.
 * FORMA-owned implementation (MIT).
 */
export class SmartPauseController {
  private policy: PerformancePolicy = { ...DEFAULT_PERFORMANCE };
  private state: SmartPauseState = { paused: false, reason: 'none' };
  private listeners = new Set<Listener>();
  private manualPause = false;

  setPolicy(p: Partial<PerformancePolicy>) {
    this.policy = { ...this.policy, ...p };
    this.reevaluate();
  }

  getPolicy() {
    return this.policy;
  }

  getState() {
    return this.state;
  }

  setManualPause(paused: boolean) {
    this.manualPause = paused;
    this.reevaluate();
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  attach() {
    const re = () => this.reevaluate();
    window.addEventListener('blur', re);
    window.addEventListener('focus', re);
    document.addEventListener('visibilitychange', re);
    return () => {
      window.removeEventListener('blur', re);
      window.removeEventListener('focus', re);
      document.removeEventListener('visibilitychange', re);
    };
  }

  private async onBattery(): Promise<boolean> {
    try {
      const nav = navigator as Navigator & {
        getBattery?: () => Promise<{ charging: boolean }>;
      };
      if (nav.getBattery) {
        const b = await nav.getBattery();
        return !b.charging;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  private async reevaluate() {
    if (this.manualPause) {
      this.emit({ paused: true, reason: 'manual' });
      return;
    }
    if (this.policy.pauseWhenHidden && document.hidden) {
      this.emit({ paused: true, reason: 'hidden' });
      return;
    }
    if (this.policy.pauseOnBlur && !document.hasFocus()) {
      this.emit({ paused: true, reason: 'blur' });
      return;
    }
    if (this.policy.pauseOnBattery && (await this.onBattery())) {
      this.emit({ paused: true, reason: 'battery' });
      return;
    }
    this.emit({ paused: false, reason: 'none' });
  }

  private emit(state: SmartPauseState) {
    this.state = state;
    this.listeners.forEach((fn) => fn(state));
  }
}

export const smartPause = new SmartPauseController();
