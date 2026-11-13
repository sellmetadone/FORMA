import { useEffect, useRef } from 'react';

type Props = {
  /** Optional media element to analyse; if omitted, draws idle bars */
  mediaEl?: HTMLMediaElement | null;
  height?: number;
};

/**
 * Lightweight canvas visualizer (AnalyserNode when media provided).
 * Not a system-wide audio capture — only for selected media in-app.
 */
export function AudioVisualizer({ mediaEl, height = 48 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    let audioCtx: AudioContext | null = null;
    let source: MediaElementAudioSourceNode | null = null;

    if (mediaEl) {
      try {
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaElementSource(mediaEl);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch {
        analyser = null;
      }
    }

    const data = new Uint8Array(analyser?.frequencyBinCount || 16);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (analyser) analyser.getByteFrequencyData(data);
      else {
        for (let i = 0; i < data.length; i++) data[i] = 20 + Math.sin(Date.now() / 200 + i) * 12;
      }
      const barW = w / data.length;
      for (let i = 0; i < data.length; i++) {
        const bh = (data[i] / 255) * h;
        ctx.fillStyle =
          getComputedStyle(document.documentElement).getPropertyValue('--forma-accent') || '#3d6b8c';
        ctx.fillRect(i * barW + 1, h - bh, barW - 2, bh);
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      try {
        source?.disconnect();
        analyser?.disconnect();
        void audioCtx?.close();
      } catch {
        /* ignore */
      }
    };
  }, [mediaEl]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={height}
      style={{ width: '100%', height, borderRadius: 6, background: 'var(--forma-bg)' }}
    />
  );
}
