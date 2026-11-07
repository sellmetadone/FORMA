export type FormaDisplay = {
  id: number;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  primary?: boolean;
};

export async function fetchDisplays(): Promise<FormaDisplay[]> {
  if (window.forma?.getDisplays) {
    try {
      const list = (await window.forma.getDisplays()) as Array<{
        id?: number;
        label?: string;
        bounds?: { x: number; y: number; width: number; height: number };
        scaleFactor?: number;
        primary?: boolean;
      }>;
      return (list || []).map((d, i) => ({
        id: d.id ?? i,
        label: d.label || `Display ${i + 1}`,
        bounds: d.bounds || { x: 0, y: 0, width: 1920, height: 1080 },
        scaleFactor: d.scaleFactor ?? 1,
        primary: d.primary,
      }));
    } catch {
      /* fall through */
    }
  }
  return [
    {
      id: 0,
      label: 'Primary',
      bounds: {
        x: 0,
        y: 0,
        width: window.screen.width,
        height: window.screen.height,
      },
      scaleFactor: window.devicePixelRatio || 1,
      primary: true,
    },
  ];
}
