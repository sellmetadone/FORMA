import { useWidgetStore } from '@/stores/widgetStore';
import { WIDGET_DEFINITIONS } from '@/core/widgets/definitions';
import { t } from '@/core/i18n';
import { ClockWidget } from './ClockWidget';
import { CalendarWidget } from './CalendarWidget';
import { NotesWidget } from './NotesWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { WeatherWidget } from './WeatherWidget';
import { QuickLinksWidget } from './QuickLinksWidget';
import { TimerWidget } from './TimerWidget';
import { AppLauncherWidget } from './AppLauncherWidget';
import { MediaWidget } from './MediaWidget';
import type { WidgetInstance } from '@/types';

interface Props {
  instance: WidgetInstance;
  showClose?: boolean;
}

export function WidgetRenderer({ instance, showClose }: Props) {
  const updateSettings = useWidgetStore((s) => s.updateSettings);
  const removeWidget = useWidgetStore((s) => s.removeWidget);
  const def = WIDGET_DEFINITIONS[instance.type];
  const title = t(def.nameKey);
  const s = instance.settings;
  void showClose;
  void removeWidget;

  switch (instance.type) {
    case 'clock':
      return (
        <ClockWidget
          title={title}
          format24={s.format24 !== false}
          showSeconds={s.showSeconds !== false}
        />
      );
    case 'calendar':
      return <CalendarWidget title={title} />;
    case 'notes':
      return (
        <NotesWidget
          title={title}
          text={String(s.text ?? '')}
          onChange={(text) => updateSettings(instance.id, { text })}
        />
      );
    case 'system-monitor':
      return <SystemMonitorWidget title={title} />;
    case 'weather':
      return (
        <WeatherWidget
          title={title}
          city={String(s.city ?? 'Amsterdam')}
          unit={(s.unit as 'c' | 'f') ?? 'c'}
          onCityChange={(city) => updateSettings(instance.id, { city })}
        />
      );
    case 'quick-links':
      return (
        <QuickLinksWidget
          title={title}
          links={(s.links as { label: string; url: string }[]) ?? []}
        />
      );
    case 'timer':
      return (
        <TimerWidget
          title={title}
          remaining={Number(s.remaining ?? 300)}
          running={Boolean(s.running)}
          total={Number(s.seconds ?? 300)}
          onChange={(patch) => updateSettings(instance.id, patch)}
        />
      );
    case 'app-launcher':
      return (
        <AppLauncherWidget
          title={title}
          apps={(s.apps as { label: string; path: string }[]) ?? []}
        />
      );
    case 'media':
      return <MediaWidget title={title} />;
    default:
      return null;
  }
}
