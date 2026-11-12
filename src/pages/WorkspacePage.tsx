import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  StickyNote,
  Clock,
  Link2,
  Square,
  Boxes,
  Undo2,
  Redo2,
  Save,
  Grid3x3,
  Trash2,
  Copy,
  AlignLeft,
  AlignVerticalJustifyStart,
  Layers,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAppStore } from '@/stores/appStore';
import { WorkspaceCanvas } from '@/components/workspace/WorkspaceCanvas';
import { logActivity } from '@/core/activity/log';
import { t } from '@/core/i18n';
import type { WorkspaceConfig, WorkspaceElementType } from '@/types';
import styles from './WorkspacePage.module.css';

const TOOLS: { type: WorkspaceElementType; icon: ReactNode; label: string }[] = [
  { type: 'note', icon: <StickyNote size={16} />, label: 'Note' },
  { type: 'clock', icon: <Clock size={16} />, label: 'Clock' },
  { type: 'link', icon: <Link2 size={16} />, label: 'Links' },
  { type: 'frame', icon: <Square size={16} />, label: 'Frame' },
  { type: 'widget-placeholder', icon: <Boxes size={16} />, label: 'Widget' },
];

export function WorkspacePage() {
  const locale = useAppStore((s) => s.locale);
  void locale;
  const addElement = useWorkspaceStore((s) => s.addElement);
  const removeElement = useWorkspaceStore((s) => s.removeElement);
  const duplicateElement = useWorkspaceStore((s) => s.duplicateElement);
  const sendToBack = useWorkspaceStore((s) => s.sendToBack);
  const bringToFront = useWorkspaceStore((s) => s.bringToFront);
  const alignSelected = useWorkspaceStore((s) => s.alignSelected);
  const selectedId = useWorkspaceStore((s) => s.selectedId);
  const dirty = useWorkspaceStore((s) => s.dirty);
  const undo = useWorkspaceStore((s) => s.undo);
  const redo = useWorkspaceStore((s) => s.redo);
  const past = useWorkspaceStore((s) => s.past);
  const future = useWorkspaceStore((s) => s.future);
  const gridSize = useWorkspaceStore((s) => s.gridSize);
  const snapToGrid = useWorkspaceStore((s) => s.snapToGrid);
  const setGrid = useWorkspaceStore((s) => s.setGrid);
  const getConfig = useWorkspaceStore((s) => s.getConfig);
  const markSaved = useWorkspaceStore((s) => s.markSaved);
  const loadConfig = useWorkspaceStore((s) => s.loadConfig);
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const name = useWorkspaceStore((s) => s.name);
  const setName = useWorkspaceStore((s) => s.setName);
  const [status, setStatus] = useState('');
  const [wsList, setWsList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      if (window.forma?.getWorkspaces) {
        try {
          const list = (await window.forma.getWorkspaces()) as { id: string; name: string; config: string }[];
          setWsList((list ?? []).map((w) => ({ id: w.id, name: w.name })));
          const current = list?.find((w) => w.id === workspaceId) ?? list?.[0];
          if (current?.config) {
            try {
              const cfg = JSON.parse(current.config) as WorkspaceConfig;
              loadConfig(current.id, cfg);
            } catch {
              /* ignore */
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        duplicateElement(selectedId);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        removeElement(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, undo, redo, duplicateElement, removeElement]);

  const save = async () => {
    const cfg = getConfig();
    const payload = {
      id: workspaceId || 'ws-default',
      name: name || cfg.name || 'Default',
      config: JSON.stringify(cfg),
    };
    if (window.forma?.saveWorkspace) {
      try {
        await window.forma.saveWorkspace(payload);
        markSaved();
        setStatus('Saved');
        logActivity('workspace.save', payload.id);
        setTimeout(() => setStatus(''), 2000);
      } catch (err) {
        setStatus(String(err));
      }
    } else {
      localStorage.setItem(`forma.workspace.${payload.id}`, JSON.stringify(cfg));
      markSaved();
      setStatus('Saved locally');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const switchWs = async (id: string) => {
    if (window.forma?.getWorkspace) {
      try {
        const row = (await window.forma.getWorkspace(id)) as { id: string; name: string; config: string };
        if (row?.config) {
          loadConfig(row.id, JSON.parse(row.config) as WorkspaceConfig);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <input
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            title="Workspace name"
          />
          {wsList.length > 0 && (
            <select
              className={styles.select}
              value={workspaceId}
              onChange={(e) => void switchWs(e.target.value)}
            >
              {wsList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}
          {TOOLS.map((tool) => (
            <button
              key={tool.type}
              type="button"
              className={styles.toolBtn}
              onClick={() => addElement(tool.type)}
              title={tool.label}
            >
              {tool.icon}
              {tool.label}
            </button>
          ))}
        </div>
        <div className={styles.toolGroup}>
          <button type="button" className={styles.iconBtn} disabled={past.length === 0} onClick={undo} title="Undo">
            <Undo2 size={16} />
          </button>
          <button type="button" className={styles.iconBtn} disabled={future.length === 0} onClick={redo} title="Redo">
            <Redo2 size={16} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={!selectedId}
            onClick={() => selectedId && duplicateElement(selectedId)}
            title="Duplicate (Ctrl+D)"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={!selectedId}
            onClick={() => selectedId && removeElement(selectedId)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={!selectedId}
            onClick={() => selectedId && bringToFront(selectedId)}
            title="Bring to front"
          >
            <Layers size={16} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={!selectedId}
            onClick={() => selectedId && sendToBack(selectedId)}
            title="Send to back"
          >
            <Layers size={16} style={{ opacity: 0.5 }} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={!selectedId}
            onClick={() => alignSelected('left')}
            title="Align left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            disabled={!selectedId}
            onClick={() => alignSelected('top')}
            title="Align top"
          >
            <AlignVerticalJustifyStart size={16} />
          </button>
        </div>
        <div className={styles.toolGroup}>
          <button
            type="button"
            className={`${styles.toolBtn} ${snapToGrid ? styles.active : ''}`}
            onClick={() => setGrid(gridSize, !snapToGrid)}
          >
            <Grid3x3 size={16} />
            Snap {gridSize}
          </button>
          <button type="button" className={styles.saveBtn} onClick={() => void save()}>
            <Save size={16} />
            Save{dirty ? ' *' : ''}
          </button>
          {status && <span className={styles.status}>{status}</span>}
        </div>
      </div>
      <WorkspaceCanvas />
      <p className={styles.hint}>
        Drag to move · corner to resize · Ctrl+Z undo · Ctrl+D duplicate · Del remove
      </p>
    </div>
  );
}
