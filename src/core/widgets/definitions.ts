import type { WidgetDefinition, WidgetTypeId } from '@/types';

export const WIDGET_DEFINITIONS: Record<WidgetTypeId, WidgetDefinition> = {
  clock: {
    id: 'clock',
    nameKey: 'widgets.clock',
    descriptionKey: 'widgets.clockDesc',
    defaultWidth: 220,
    defaultHeight: 120,
    refreshMs: 1000,
  },
  calendar: {
    id: 'calendar',
    nameKey: 'widgets.calendar',
    descriptionKey: 'widgets.calendarDesc',
    defaultWidth: 260,
    defaultHeight: 240,
    refreshMs: 60_000,
  },
  notes: {
    id: 'notes',
    nameKey: 'widgets.notes',
    descriptionKey: 'widgets.notesDesc',
    defaultWidth: 260,
    defaultHeight: 180,
    refreshMs: 0,
  },
  'system-monitor': {
    id: 'system-monitor',
    nameKey: 'widgets.systemMonitor',
    descriptionKey: 'widgets.systemMonitorDesc',
    defaultWidth: 240,
    defaultHeight: 140,
    refreshMs: 2000,
  },
  weather: {
    id: 'weather',
    nameKey: 'widgets.weather',
    descriptionKey: 'widgets.weatherDesc',
    defaultWidth: 220,
    defaultHeight: 140,
    refreshMs: 600_000,
  },
  'quick-links': {
    id: 'quick-links',
    nameKey: 'widgets.quickLinks',
    descriptionKey: 'widgets.quickLinksDesc',
    defaultWidth: 220,
    defaultHeight: 160,
    refreshMs: 0,
  },
  timer: {
    id: 'timer',
    nameKey: 'widgets.timer',
    descriptionKey: 'widgets.timerDesc',
    defaultWidth: 200,
    defaultHeight: 140,
    refreshMs: 250,
  },
  'app-launcher': {
    id: 'app-launcher',
    nameKey: 'widgets.appLauncher',
    descriptionKey: 'widgets.appLauncherDesc',
    defaultWidth: 240,
    defaultHeight: 180,
    refreshMs: 0,
  },
};

export const WIDGET_TYPE_IDS = Object.keys(WIDGET_DEFINITIONS) as WidgetTypeId[];
