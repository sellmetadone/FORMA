import { create } from 'zustand';
import type { WorkspaceElement, WorkspaceElementType, WorkspaceConfig } from '@/types';
import { eventBus } from '@/core/events/eventBus';

function uid(prefix = 'el') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function snap(value: number, grid: number, enabled: boolean) {
  if (!enabled || grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

interface HistoryEntry {
  elements: WorkspaceElement[];
}

interface WorkspaceState {
  workspaceId: string;
  name: string;
  elements: WorkspaceElement[];
  selectedId: string | null;
  gridSize: number;
  snapToGrid: boolean;
  past: HistoryEntry[];
  future: HistoryEntry[];
  dirty: boolean;

  loadConfig: (id: string, config: WorkspaceConfig) => void;
  setName: (name: string) => void;
  addElement: (type: WorkspaceElementType, at?: { x: number; y: number }) => void;
  updateElement: (id: string, patch: Partial<WorkspaceElement>, recordHistory?: boolean) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  alignSelected: (mode: 'left' | 'center' | 'top') => void;
  setGrid: (size: number, snap: boolean) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  getConfig: () => WorkspaceConfig;
  markSaved: () => void;
  clear: () => void;
}

const DEFAULTS: Record<WorkspaceElementType, { width: number; height: number; title: string }> = {
  note: { width: 240, height: 160, title: 'Note' },
  clock: { width: 200, height: 100, title: 'Clock' },
  link: { width: 220, height: 120, title: 'Quick Links' },
  frame: { width: 280, height: 200, title: 'Frame' },
  'widget-placeholder': { width: 200, height: 140, title: 'Widget' },
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaceId: 'ws-default',
  name: 'Default',
  elements: [],
  selectedId: null,
  gridSize: 20,
  snapToGrid: true,
  past: [],
  future: [],
  dirty: false,

  loadConfig: (id, config) => {
    set({
      workspaceId: id,
      name: config.name || 'Default',
      elements: config.elements ?? [],
      gridSize: config.gridSize ?? 20,
      snapToGrid: config.snapToGrid ?? true,
      selectedId: null,
      past: [],
      future: [],
      dirty: false,
    });
  },

  setName: (name) => set({ name, dirty: true }),

  pushHistory: () => {
    const { elements, past } = get();
    set({
      past: [...past.slice(-49), { elements: structuredClone(elements) }],
      future: [],
    });
  },

  addElement: (type, at) => {
    get().pushHistory();
    const def = DEFAULTS[type];
    const { gridSize, snapToGrid, elements } = get();
    const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
    const el: WorkspaceElement = {
      id: uid(),
      type,
      x: snap(at?.x ?? 60 + elements.length * 16, gridSize, snapToGrid),
      y: snap(at?.y ?? 60 + elements.length * 16, gridSize, snapToGrid),
      width: def.width,
      height: def.height,
      zIndex: maxZ + 1,
      title: def.title,
      content: type === 'note' ? '' : undefined,
    };
    set({ elements: [...elements, el], selectedId: el.id, dirty: true });
    eventBus.emit('workspace:updated');
  },

  updateElement: (id, patch, recordHistory = false) => {
    if (recordHistory) get().pushHistory();
    const { gridSize, snapToGrid, elements } = get();
    const next = elements.map((e) => {
      if (e.id !== id) return e;
      const merged = { ...e, ...patch };
      if (patch.x !== undefined) merged.x = snap(merged.x, gridSize, snapToGrid);
      if (patch.y !== undefined) merged.y = snap(merged.y, gridSize, snapToGrid);
      if (patch.width !== undefined)
        merged.width = Math.max(80, snap(merged.width, gridSize, snapToGrid));
      if (patch.height !== undefined)
        merged.height = Math.max(60, snap(merged.height, gridSize, snapToGrid));
      return merged;
    });
    set({ elements: next, dirty: true });
    eventBus.emit('workspace:updated');
  },

  removeElement: (id) => {
    get().pushHistory();
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      dirty: true,
    }));
    eventBus.emit('widget:removed', id);
    eventBus.emit('workspace:updated');
  },

  duplicateElement: (id) => {
    const el = get().elements.find((e) => e.id === id);
    if (!el) return;
    get().pushHistory();
    const maxZ = get().elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
    const copy: WorkspaceElement = {
      ...structuredClone(el),
      id: uid(),
      x: el.x + 24,
      y: el.y + 24,
      zIndex: maxZ + 1,
      title: `${el.title} copy`,
    };
    set((s) => ({
      elements: [...s.elements, copy],
      selectedId: copy.id,
      dirty: true,
    }));
    eventBus.emit('workspace:updated');
  },

  selectElement: (id) => set({ selectedId: id }),

  bringToFront: (id) => {
    const maxZ = get().elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
    get().updateElement(id, { zIndex: maxZ + 1 }, true);
  },

  sendToBack: (id) => {
    const minZ = get().elements.reduce((m, e) => Math.min(m, e.zIndex), 0);
    get().updateElement(id, { zIndex: minZ - 1 }, true);
  },

  alignSelected: (mode) => {
    const { selectedId, elements } = get();
    if (!selectedId || elements.length < 2) return;
    get().pushHistory();
    const sel = elements.find((e) => e.id === selectedId);
    if (!sel) return;
    const others = elements.filter((e) => e.id !== selectedId);
    if (mode === 'left') {
      const x = Math.min(...others.map((e) => e.x), sel.x);
      get().updateElement(selectedId, { x }, false);
    } else if (mode === 'top') {
      const y = Math.min(...others.map((e) => e.y), sel.y);
      get().updateElement(selectedId, { y }, false);
    } else if (mode === 'center') {
      const cx =
        others.reduce((s, e) => s + e.x + e.width / 2, 0) / Math.max(1, others.length);
      get().updateElement(selectedId, { x: cx - sel.width / 2 }, false);
    }
  },

  setGrid: (size, snapEnabled) => {
    set({ gridSize: size, snapToGrid: snapEnabled, dirty: true });
  },

  undo: () => {
    const { past, elements, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ elements: structuredClone(elements) }, ...future],
      elements: prev.elements,
      dirty: true,
    });
  },

  redo: () => {
    const { past, elements, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: [...past, { elements: structuredClone(elements) }],
      elements: next.elements,
      dirty: true,
    });
  },

  getConfig: () => {
    const { name, elements, gridSize, snapToGrid } = get();
    return { name, elements, gridSize, snapToGrid };
  },

  markSaved: () => set({ dirty: false }),

  clear: () => {
    get().pushHistory();
    set({ elements: [], selectedId: null, dirty: true });
  },
}));
