export type RectShape = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: true;
};

export type ArrowShape = {
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

export type Shape = RectShape | ArrowShape;

// 型ガード関数
export function isRectShape(shape: Shape): shape is RectShape {
  return 'width' in shape;
}

export function isArrowShape(shape: Shape): shape is ArrowShape {
  return 'points' in shape;
}
