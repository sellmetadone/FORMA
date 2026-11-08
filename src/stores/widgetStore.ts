import { create } from 'zustand';
import type { WidgetInstance, WidgetTypeId } from '@/types';
import { WIDGET_DEFINITIONS } from '@/core/widgets/definitions';
import { eventBus } from '@/core/events/eventBus';

function uid() {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function persist(instances: WidgetInstance[]) {
  try {
    localStorage.setItem('forma.widgets', JSON.stringify(instances));
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.forma?.setSetting) {
    window.forma.setSetting('widgets.instances', JSON.stringify(instances)).catch(() => {});
  }
}

interface WidgetState {
  instances: WidgetInstance[];
  selectedId: string | null;
  load: (list?: WidgetInstance[]) => void;
  addWidget: (type: WidgetTypeId) => void;
  removeWidget: (id: string) => void;
  toggleEnabled: (id: string) => void;
  updateSettings: (id: string, settings: Record<string, unknown>) => void;
  updateLayout: (id: string, patch: Partial<Pick<WidgetInstance, 'x' | 'y' | 'width' | 'height' | 'zIndex'>>) => void;
  select: (id: string | null) => void;
  getByType: (type: WidgetTypeId) => WidgetInstance[];
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  instances: [],
  selectedId: null,

  load: (list) => {
    if (list) {
      set({ instances: list });
      return;
    }
    try {
      const raw = localStorage.getItem('forma.widgets');
      if (raw) {
        set({ instances: JSON.parse(raw) as WidgetInstance[] });
        return;
      }
    } catch {
      /* ignore */
    }
    set({ instances: [] });
  },

  addWidget: (type) => {
    const def = WIDGET_DEFINITIONS[type];
    const count = get().instances.filter((i) => i.type === type).length;
    const maxZ = get().instances.reduce((m, i) => Math.max(m, i.zIndex), 0);
    const inst: WidgetInstance = {
      id: uid(),
      type,
      enabled: true,
      x: 40 + count * 24,
      y: 40 + count * 24,
      width: def.defaultWidth,
      height: def.defaultHeight,
      zIndex: maxZ + 1,
      settings:
        type === 'notes'
          ? { text: '' }
          : type === 'timer'
            ? { seconds: 300, remaining: 300, running: false }
            : type === 'quick-links'
              ? {
                  links: [
                    { label: 'FORMA', url: 'https://github.com/sellmetadone/FORMA' },
                    { label: 'GitHub', url: 'https://github.com' },
                  ],
                }
              : type === 'weather'
                ? { city: 'Amsterdam', unit: 'c' }
                : type === 'app-launcher'
                  ? {
                      apps: [
                        { label: 'Notepad', path: 'notepad.exe' },
                        { label: 'Explorer', path: 'explorer.exe' },
                        { label: 'Calc', path: 'calc.exe' },
                      ],
                    }
                  : type === 'clock'
                    ? { format24: true, showSeconds: true }
                    : {},
    };
    const next = [...get().instances, inst];
    set({ instances: next, selectedId: inst.id });
    persist(next);
    eventBus.emit('widget:added', inst.id);
  },

  removeWidget: (id) => {
    const next = get().instances.filter((i) => i.id !== id);
    set({
      instances: next,
      selectedId: get().selectedId === id ? null : get().selectedId,
    });
    persist(next);
    eventBus.emit('widget:removed', id);
  },

  toggleEnabled: (id) => {
    const next = get().instances.map((i) =>
      i.id === id ? { ...i, enabled: !i.enabled } : i
    );
    set({ instances: next });
    persist(next);
  },

  updateSettings: (id, settings) => {
    const next = get().instances.map((i) =>
      i.id === id ? { ...i, settings: { ...i.settings, ...settings } } : i
    );
    set({ instances: next });
    persist(next);
  },

  updateLayout: (id, patch) => {
    const next = get().instances.map((i) => (i.id === id ? { ...i, ...patch } : i));
    set({ instances: next });
    persist(next);
  },

  select: (id) => set({ selectedId: id }),

  getByType: (type) => get().instances.filter((i) => i.type === type),
}));
