import { useEffect, useRef } from 'react';
import { smartPause } from '@/core/wallpaper/smartPause';

type Props = {
  src: string;
  muted?: boolean;
  maxFps?: number;
  className?: string;
};

/** In-app video wallpaper preview. System WorkerW desktop video is separate. */
export function VideoRenderer({ src, muted = true, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const unsub = smartPause.subscribe((st) => {
      const v = ref.current;
      if (!v) return;
      if (st.paused) v.pause();
      else void v.play().catch(() => undefined);
    });
    const detach = smartPause.attach();
    return () => {
      unsub();
      detach();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted={muted}
      loop
      playsInline
      autoPlay
      style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
    />
  );
}
