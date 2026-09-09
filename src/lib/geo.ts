export const MAP_WIDTH = 380;
export const MAP_HEIGHT = 490;

const LON_MIN = 33.9;
const LON_MAX = 41.9;
const LAT_MIN = -4.7;
const LAT_MAX = 5.5;

export function project(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_HEIGHT;
  return { x, y };
}

export const KENYA_OUTLINE = 'M4.8,48 L95,50.4 L194.8,91.3 L337.3,74.5 L365.8,182.6 L337.3,307.5 L313.5,360.3 L332.5,373.3 L285,427.7 L270.8,458.9 L218.5,485.1 L171,487.5 L76,485.1 L4.8,312.3 L0,240.2 L19,177.7 L33.3,120.1 Z';

export const LAKE_VICTORIA = { cx: 14, cy: 236, rx: 13, ry: 22 };
