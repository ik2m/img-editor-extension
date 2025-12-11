import type { RectShape, ArrowShape, TextShape } from '@/components/editor/types';

/**
 * 16進数カラーコードからRGBA文字列を生成
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 矩形図形を作成
 */
export function createRectangle(
  name: string,
  color: string,
  x = 100,
  y = 100,
  width = 200,
  height = 150
): RectShape {
  return {
    type: 'rect',
    id: `rect-${Date.now()}`,
    name,
    x,
    y,
    width,
    height,
    fill: 'transparent',
    stroke: hexToRgba(color, 0.7),
    strokeWidth: 8,
    cornerRadius: 2,
    draggable: true,
  };
}

/**
 * 矢印図形を作成
 */
export function createArrow(
  name: string,
  color: string,
  x1 = 100,
  y1 = 100,
  x2 = 300,
  y2 = 200
): ArrowShape {
  return {
    type: 'arrow',
    id: `arrow-${Date.now()}`,
    name,
    points: [x1, y1, x2, y2],
    stroke: hexToRgba(color, 0.7),
    strokeWidth: 8,
    fill: hexToRgba(color, 0.7),
    pointerLength: 20,
    pointerWidth: 20,
    lineCap: 'round',
    lineJoin: 'round',
    draggable: true,
  };
}

/**
 * テキスト図形を作成
 */
export function createText(
  name: string,
  text: string,
  color: string,
  x = 100,
  y = 100
): TextShape {
  const fontSize = 24;
  // テキストの幅を推定（日本語の場合、フォントサイズとほぼ同じ幅）
  const estimatedWidth = text.length * fontSize;

  return {
    type: 'text',
    id: `text-${Date.now()}`,
    name,
    x,
    y,
    text,
    fontSize,
    fontFamily: 'Noto Sans JP',
    fontStyle: 'bold',
    fill: color,
    align: 'center',
    offsetX: estimatedWidth / 2,
    offsetY: fontSize / 2,
    draggable: true,
  };
}
