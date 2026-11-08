import { useEffect, useState } from 'react';
import { smartPause } from '@/core/wallpaper/smartPause';

type Props = {
  url: string;
  className?: string;
};

/** Sandboxed web wallpaper preview (iframe). */
export function WebRenderer({ url, className }: Props) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const unsub = smartPause.subscribe((st) => setPaused(st.paused));
    const detach = smartPause.attach();
    return () => {
      unsub();
      detach();
    };
  }, []);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        title="Web wallpaper preview"
        src={paused ? 'about:blank' : url}
        sandbox="allow-scripts allow-same-origin"
        style={{
          border: 0,
          width: '100%',
          height: '100%',
          background: '#111',
          pointerEvents: paused ? 'none' : 'auto',
        }}
      />
      {paused && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: 13,
          }}
        >
          Paused (SmartPause)
        </div>
      )}
    </div>
  );
}
