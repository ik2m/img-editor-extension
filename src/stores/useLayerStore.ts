import { ref, readonly } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { Shape } from '@/components/editor/types';

/**
 * レイヤー（Shape配列）の管理を行うstore
 */
const useLayerStore = defineStore('layer', () => {
  const shapes = ref<Shape[]>([]);
  const drawingLayer = ref<Shape | null>(null);
  const selectedShapeId = ref('');

  const selectLayer = (id: string) => {
    selectedShapeId.value = id;
  };

  const addShape = (shape: Shape) => {
    shapes.value.push(shape);
  };

  const addShapeAt = (shape: Shape, index: number) => {
    shapes.value.splice(index, 0, shape);
  };

  const resetShapes = () => {
    shapes.value = [];
    drawingLayer.value = null;
  };

  const setDrawingLayer = (layer: Shape) => {
    drawingLayer.value = layer;
  };

  const resetDrawingLayer = () => {
    drawingLayer.value = null;
  };

  const scaleShapes = (ratio: number) => {
    const scaleShape = (shape: Shape) => {
      if ('x' in shape && 'y' in shape) {
        shape.x = shape.x * ratio;
        shape.y = shape.y * ratio;
        if ('width' in shape && 'height' in shape) {
          shape.width = shape.width * ratio;
          shape.height = shape.height * ratio;
        }
        if ('fontSize' in shape) {
          shape.fontSize = Math.round(shape.fontSize * ratio);
        }
      }
      if ('points' in shape && Array.isArray(shape.points)) {
        const scaledPoints = shape.points.map((p) => p * ratio);
        shape.points = [
          scaledPoints[0],
          scaledPoints[1],
          scaledPoints[2],
          scaledPoints[3],
        ];
      }
      if ('strokeWidth' in shape) {
        shape.strokeWidth = Math.max(1, Math.round(shape.strokeWidth * ratio));
      }
      if ('lines' in shape) {
        shape.lines.forEach((line) => {
          line.points = line.points.map((p) => p * ratio);
          line.strokeWidth = Math.max(1, Math.round(line.strokeWidth * ratio));
        });
      }
    };

    shapes.value.forEach(scaleShape);
    if (drawingLayer.value) {
      scaleShape(drawingLayer.value);
    }
  };

  const moveLayerUp = (id: string) => {
    const index = shapes.value.findIndex((s) => s.id === id);
    if (index < shapes.value.length - 1) {
      [shapes.value[index], shapes.value[index + 1]] = [
        shapes.value[index + 1],
        shapes.value[index],
      ];
    }
  };

  const moveLayerDown = (id: string) => {
    const index = shapes.value.findIndex((s) => s.id === id);
    if (index > 0) {
      [shapes.value[index], shapes.value[index - 1]] = [
        shapes.value[index - 1],
        shapes.value[index],
      ];
    }
  };

  const deleteLayer = (id: string) => {
    const index = shapes.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      shapes.value.splice(index, 1);
      if (selectedShapeId.value === id) {
        selectedShapeId.value = '';
      }
    }
  };

  const reorderLayers = (fromIndex: number, toIndex: number) => {
    const [removed] = shapes.value.splice(fromIndex, 1);
    shapes.value.splice(toIndex, 0, removed);
  };

  // 図形更新のアクション
  const updateArrowPoint = (
    shapeId: string,
    pointIndex: number,
    x: number,
    y: number
  ) => {
    const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
    if (shapeIndex === -1) return;

    const shape = shapes.value[shapeIndex];
    if (shape.type !== 'arrow') return;

    const newPoints = [...shape.points] as [number, number, number, number];
    if (pointIndex === 0) {
      newPoints[0] = x;
      newPoints[1] = y;
    } else if (pointIndex === 2) {
      newPoints[2] = x;
      newPoints[3] = y;
    }

    shapes.value = [
      ...shapes.value.slice(0, shapeIndex),
      { ...shape, points: newPoints },
      ...shapes.value.slice(shapeIndex + 1),
    ];
  };

  const updateRectCorner = (
    shapeId: string,
    corner: string,
    x: number,
    y: number
  ) => {
    const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
    if (shapeIndex === -1) return;

    const shape = shapes.value[shapeIndex];
    if (shape.type !== 'rect') return;

    let newX = shape.x;
    let newY = shape.y;
    let newWidth = shape.width;
    let newHeight = shape.height;

    switch (corner) {
      case 'tl':
        newWidth = shape.x + shape.width - x;
        newHeight = shape.y + shape.height - y;
        newX = x;
        newY = y;
        break;
      case 'tr':
        newWidth = x - shape.x;
        newHeight = shape.y + shape.height - y;
        newY = y;
        break;
      case 'bl':
        newWidth = shape.x + shape.width - x;
        newHeight = y - shape.y;
        newX = x;
        break;
      case 'br':
        newWidth = x - shape.x;
        newHeight = y - shape.y;
        break;
    }

    if (newWidth < 10) newWidth = 10;
    if (newHeight < 10) newHeight = 10;

    shapes.value = [
      ...shapes.value.slice(0, shapeIndex),
      { ...shape, x: newX, y: newY, width: newWidth, height: newHeight },
      ...shapes.value.slice(shapeIndex + 1),
    ];
  };

  const updateTextPosition = (shapeId: string, x: number, y: number) => {
    const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
    if (shapeIndex === -1) return;

    const shape = shapes.value[shapeIndex];
    if (shape.type !== 'text') return;

    shapes.value = [
      ...shapes.value.slice(0, shapeIndex),
      { ...shape, x, y },
      ...shapes.value.slice(shapeIndex + 1),
    ];
  };

  const updateRectPosition = (shapeId: string, x: number, y: number) => {
    const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
    if (shapeIndex === -1) return;

    const shape = shapes.value[shapeIndex];
    if (shape.type !== 'rect') return;

    shapes.value = [
      ...shapes.value.slice(0, shapeIndex),
      { ...shape, x, y },
      ...shapes.value.slice(shapeIndex + 1),
    ];
  };

  const updateArrowPosition = (
    shapeId: string,
    deltaX: number,
    deltaY: number
  ) => {
    const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
    if (shapeIndex === -1) return;

    const shape = shapes.value[shapeIndex];
    if (shape.type !== 'arrow') return;

    const newPoints: [number, number, number, number] = [
      shape.points[0] + deltaX,
      shape.points[1] + deltaY,
      shape.points[2] + deltaX,
      shape.points[3] + deltaY,
    ];

    shapes.value = [
      ...shapes.value.slice(0, shapeIndex),
      { ...shape, points: newPoints },
      ...shapes.value.slice(shapeIndex + 1),
    ];
  };

  const updateTextFontSize = (shapeId: string, fontSize: number) => {
    const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
    if (shapeIndex === -1) return;

    const shape = shapes.value[shapeIndex];
    if (shape.type !== 'text') return;

    shapes.value = [
      ...shapes.value.slice(0, shapeIndex),
      { ...shape, fontSize },
      ...shapes.value.slice(shapeIndex + 1),
    ];
  };

  return {
    shapes: readonly(shapes),
    drawingLayer: readonly(drawingLayer),
    selectedShapeId,
    selectLayer,
    addShape,
    addShapeAt,
    resetShapes,
    setDrawingLayer,
    resetDrawingLayer,
    scaleShapes,
    moveLayerUp,
    moveLayerDown,
    deleteLayer,
    reorderLayers,
    updateArrowPoint,
    updateRectCorner,
    updateTextPosition,
    updateRectPosition,
    updateArrowPosition,
    updateTextFontSize,
  };
});

/**
 * レイヤーストアを使用する
 * stateとactionsを分割代入可能な形で返す
 * shapes は readonly として扱う（storeToRefsで自動的にreadonlyになる）
 */
export default () => {
  const store = useLayerStore();
  const refs = storeToRefs(store);
  return {
    ...store,
    ...refs,
  };
};
