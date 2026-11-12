import { useCallback, useRef, useState, type PointerEvent as RPE } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { WorkspaceElement } from '@/types';
import styles from './WorkspaceCanvas.module.css';

type DragMode = 'move' | 'resize' | null;

export function WorkspaceCanvas() {
  const elements = useWorkspaceStore((s) => s.elements);
  const selectedId = useWorkspaceStore((s) => s.selectedId);
  const gridSize = useWorkspaceStore((s) => s.gridSize);
  const snapToGrid = useWorkspaceStore((s) => s.snapToGrid);
  const selectElement = useWorkspaceStore((s) => s.selectElement);
  const updateElement = useWorkspaceStore((s) => s.updateElement);
  const bringToFront = useWorkspaceStore((s) => s.bringToFront);
  const pushHistory = useWorkspaceStore((s) => s.pushHistory);

  const [mode, setMode] = useState<DragMode>(null);
  const [guides, setGuides] = useState<{ v?: number; h?: number }>({});
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const onPointerDownMove = useCallback(
    (e: RPE<HTMLDivElement>, el: WorkspaceElement) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      selectElement(el.id);
      bringToFront(el.id);
      pushHistory();
      setMode('move');
      dragRef.current = {
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origW: el.width,
        origH: el.height,
      };
    },
    [selectElement, bringToFront, pushHistory]
  );

  const onPointerDownResize = useCallback(
    (e: RPE<HTMLDivElement>, el: WorkspaceElement) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      selectElement(el.id);
      pushHistory();
      setMode('resize');
      dragRef.current = {
        id: el.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origW: el.width,
        origH: el.height,
      };
    },
    [selectElement, pushHistory]
  );

  const onPointerMove = useCallback(
    (e: RPE<HTMLDivElement>) => {
      if (!mode || !dragRef.current) return;
      const d = dragRef.current;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (mode === 'move') {
        let x = d.origX + dx;
        let y = d.origY + dy;
        const others = elements.filter((el) => el.id !== d.id);
        let gv: number | undefined;
        let gh: number | undefined;
        for (const o of others) {
          if (Math.abs(x - o.x) < 6) {
            x = o.x;
            gv = o.x;
          }
          if (Math.abs(y - o.y) < 6) {
            y = o.y;
            gh = o.y;
          }
        }
        setGuides({ v: gv, h: gh });
        updateElement(d.id, { x, y }, false);
      } else if (mode === 'resize') {
        updateElement(
          d.id,
          {
            width: Math.max(80, d.origW + dx),
            height: Math.max(60, d.origH + dy),
          },
          false
        );
      }
    },
    [mode, elements, updateElement]
  );

  const onPointerUp = useCallback(() => {
    setMode(null);
    dragRef.current = null;
    setGuides({});
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={styles.canvas}
      style={{
        backgroundImage: snapToGrid
          ? `radial-gradient(circle, var(--forma-border) 1px, transparent 1px)`
          : undefined,
        backgroundSize: snapToGrid ? `${gridSize}px ${gridSize}px` : undefined,
      }}
      onPointerDown={() => selectElement(null)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {guides.v != null && <div className={styles.guideV} style={{ left: guides.v }} />}
      {guides.h != null && <div className={styles.guideH} style={{ top: guides.h }} />}
      {elements.map((el) => (
        <div
          key={el.id}
          className={`${styles.element} ${selectedId === el.id ? styles.selected : ''}`}
          style={{
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            zIndex: el.zIndex,
          }}
          onPointerDown={(e) => onPointerDownMove(e, el)}
        >
          <div className={styles.elementHeader}>
            <span className={styles.elementTitle}>{el.title}</span>
            <span className={styles.elementType}>{el.type}</span>
          </div>
          <div className={styles.elementBody}>
            {el.type === 'clock' && <div className={styles.clockFace}>{timeStr}</div>}
            {el.type === 'note' && (
              <div className={styles.notePreview}>{el.content || 'Empty note'}</div>
            )}
            {el.type === 'link' && <div className={styles.placeholder}>Quick links</div>}
            {el.type === 'frame' && <div className={styles.placeholder}>Frame</div>}
            {el.type === 'widget-placeholder' && (
              <div className={styles.placeholder}>Widget slot</div>
            )}
          </div>
          {selectedId === el.id && (
            <div
              className={styles.resizeHandle}
              onPointerDown={(e) => onPointerDownResize(e, el)}
            />
          )}
        </div>
      ))}
      {elements.length === 0 && (
        <div className={styles.empty}>
          Add elements from the toolbar · drag to move · corner to resize
        </div>
      )}
    </div>
  );
}
