export type RectShape = {
  type: 'rect';
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  draggable: true;
};

export type ArrowShape = {
  type: 'arrow';
  id: string;
  name: string;
  points: [number, number, number, number]; // [x1, y1, x2, y2]
  stroke: string;
  strokeWidth: number;
  fill: string;
  pointerLength: number;
  pointerWidth: number;
  draggable: true;
};

export type DrawingLine = {
  points: number[]; // [x1, y1, x2, y2, x3, y3, ...]
  stroke: string;
  strokeWidth: number;
};

export type DrawingShape = {
  type: 'drawing';
  id: string;
  name: string;
  lines: DrawingLine[];
  tension: number; // 曲線の滑らかさ (0-1)
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
  draggable: false; // お絵描きレイヤーはドラッグ不可
};

export type TextShape = {
  type: 'text';
  id: string;
  name: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fill: string;
  align: 'left' | 'center' | 'right';
  offsetX?: number;
  offsetY?: number;
  draggable: true;
};

export type Shape = RectShape | ArrowShape | DrawingShape | TextShape;

// 型ガード関数
export function isRectShape(shape: Shape): shape is RectShape {
  return shape.type === 'rect';
}

export function isArrowShape(shape: Shape): shape is ArrowShape {
  return shape.type === 'arrow';
}

export function isDrawingShape(shape: Shape): shape is DrawingShape {
  return shape.type === 'drawing';
}

export function isTextShape(shape: Shape): shape is TextShape {
  return shape.type === 'text';
}
