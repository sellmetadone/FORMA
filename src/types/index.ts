export type FormaEvent =
  | 'theme:changed'
  | 'profile:activated'
  | 'workspace:updated'
  | 'wallpaper:changed'
  | 'widget:added'
  | 'widget:removed'
  | 'layout:changed'
  | 'settings:updated';

export interface Profile {
  id: string;
  name: string;
  theme_id: string | null;
  wallpaper_id: string | null;
  layout_id: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  is_dark: number;
  colors: string;
  fonts?: string;
  radii?: string;
  created_at: string;
}

export interface Wallpaper {
  id: string;
  name: string;
  path: string;
  category: string | null;
  is_favorite: number;
  created_at: string;
}

export interface LayoutRecord {
  id: string;
  name: string;
  config: string;
  is_preset: number;
  created_at: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  profile_id: string | null;
  config: string;
  created_at: string;
}

export type WorkspaceElementType =
  | 'note'
  | 'clock'
  | 'link'
  | 'frame'
  | 'widget-placeholder';

export interface WorkspaceElement {
  id: string;
  type: WorkspaceElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  title: string;
  content?: string;
  color?: string;
}

export interface WorkspaceConfig {
  name: string;
  elements: WorkspaceElement[];
  gridSize: number;
  snapToGrid: boolean;
}

export interface ProfileExport {
  formatVersion: number;
  application: 'FORMA';
  profile: {
    name: string;
    theme: string;
    wallpaper?: string;
    workspace?: string;
    widgets?: unknown[];
    layout?: { type: string; elements?: WorkspaceElement[] };
  };
}

export type PageId =
  | 'overview'
  | 'workspace'
  | 'themes'
  | 'wallpapers'
  | 'widgets'
  | 'appearance'
  | 'layouts'
  | 'profiles'
  | 'icons'
  | 'settings';

export type WidgetTypeId =
  | 'clock'
  | 'calendar'
  | 'notes'
  | 'system-monitor'
  | 'weather'
  | 'quick-links'
  | 'timer'
  | 'app-launcher';

export interface WidgetDefinition {
  id: WidgetTypeId;
  nameKey: string;
  descriptionKey: string;
  defaultWidth: number;
  defaultHeight: number;
  refreshMs: number;
}

export interface WidgetInstance {
  id: string;
  type: WidgetTypeId;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  settings: Record<string, unknown>;
}

export interface SystemStats {
  cpuPercent: number;
  memUsedMb: number;
  memTotalMb: number;
  memPercent: number;
  platform: string;
  uptimeSec?: number;
  cpuCount?: number;
  loadAvg?: number[];
}

export interface DisplayInfo {
  id: number;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  primary: boolean;
}
