/** Accessibility helpers — focus trap, announce, high contrast. */

export function trapFocus(container: HTMLElement): () => void {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const getFocusable = () =>
    Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const list = getFocusable();
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeyDown);
  const prev = document.activeElement as HTMLElement | null;
  const list = getFocusable();
  list[0]?.focus();
  return () => {
    container.removeEventListener('keydown', onKeyDown);
    prev?.focus?.();
  };
}

let liveRegion: HTMLElement | null = null;

export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'forma-sr-only';
    document.body.appendChild(liveRegion);
  }
  liveRegion.setAttribute('aria-live', politeness);
  liveRegion.textContent = '';
  void liveRegion.offsetWidth;
  liveRegion.textContent = message;
}

export function setHighContrast(enabled: boolean) {
  document.documentElement.dataset.contrast = enabled ? 'high' : 'normal';
  try {
    localStorage.setItem('forma.a11y.highContrast', enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function loadHighContrast(): boolean {
  try {
    return localStorage.getItem('forma.a11y.highContrast') === '1';
  } catch {
    return false;
  }
}

export function applyStoredA11y() {
  if (loadHighContrast()) setHighContrast(true);
}
