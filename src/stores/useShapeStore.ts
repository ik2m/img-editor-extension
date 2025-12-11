import { ref, readonly } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { Shape, RectShape, ArrowShape, TextShape } from '@/components/editor/types';
import { createRectangle, createArrow, createText } from '@/utils/shapeFactory';

/**
 * Shape配列の管理と図形名の自動採番を行うstore
 */
const useShapeStore = defineStore('shape', () => {
  const shapes = ref<Shape[]>([]);
  const selectedShapeId = ref('');

  // 図形名の自動採番用カウンター
  const rectCounter = ref(1);
  const arrowCounter = ref(1);
  const textCounter = ref(1);

  const selectLayer = (id: string) => {
    selectedShapeId.value = id;
  };

  const addRectShape = (color: string) => {
    const rect = createRectangle(getNextRectName(), color);
    shapes.value.push(rect);
    return rect;
  };

  const addArrowShape = (color: string) => {
    const arrow = createArrow(getNextArrowName(), color);
    shapes.value.push(arrow);
    return arrow;
  };

  const addTextShape = (inputText: string, color: string, x: number, y: number) => {
    const text = createText(getNextTextName(), inputText, color, x, y);
    shapes.value.push(text);
    return text;
  };

  const resetShapes = () => {
    shapes.value = [];
  };

  const resetCounters = () => {
    rectCounter.value = 1;
    arrowCounter.value = 1;
    textCounter.value = 1;
  };

  const getNextRectName = () => `矩形 ${rectCounter.value++}`;
  const getNextArrowName = () => `矢印 ${arrowCounter.value++}`;
  const getNextTextName = () => `テキスト ${textCounter.value++}`;

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

  // 図形更新のヘルパー関数
  const replaceShape = (shapeId: string, updates: Partial<Shape>) => {
    shapes.value = shapes.value.map((s) =>
      s.id === shapeId ? { ...s, ...updates } : s
    ) as Shape[];
  };

  // 図形更新のアクション
  const updateArrowPoint = (
    shapeId: string,
    pointIndex: number,
    x: number,
    y: number
  ) => {
    const shape = shapes.value.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'arrow') return;

    const newPoints = [...shape.points] as [number, number, number, number];
    if (pointIndex === 0) {
      newPoints[0] = x;
      newPoints[1] = y;
    } else if (pointIndex === 2) {
      newPoints[2] = x;
      newPoints[3] = y;
    }

    replaceShape(shapeId, { points: newPoints });
  };

  const updateRectCorner = (
    shapeId: string,
    corner: string,
    x: number,
    y: number
  ) => {
    const shape = shapes.value.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'rect') return;

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

    replaceShape(shapeId, { x: newX, y: newY, width: newWidth, height: newHeight });
  };

  const updateTextPosition = (shapeId: string, x: number, y: number) => {
    const shape = shapes.value.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'text') return;

    replaceShape(shapeId, { x, y });
  };

  const updateRectPosition = (shapeId: string, x: number, y: number) => {
    const shape = shapes.value.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'rect') return;

    replaceShape(shapeId, { x, y });
  };

  const updateArrowPosition = (
    shapeId: string,
    deltaX: number,
    deltaY: number
  ) => {
    const shape = shapes.value.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'arrow') return;

    const newPoints: [number, number, number, number] = [
      shape.points[0] + deltaX,
      shape.points[1] + deltaY,
      shape.points[2] + deltaX,
      shape.points[3] + deltaY,
    ];

    replaceShape(shapeId, { points: newPoints });
  };

  const updateTextFontSize = (shapeId: string, fontSize: number) => {
    const shape = shapes.value.find((s) => s.id === shapeId);
    if (!shape || shape.type !== 'text') return;

    replaceShape(shapeId, { fontSize });
  };

  return {
    shapes,
    selectedShapeId,
    rectCounter,
    arrowCounter,
    textCounter,
    selectLayer,
    addRectShape,
    addArrowShape,
    addTextShape,
    resetShapes,
    resetCounters,
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
 * Shapeストアを使用する
 * stateとactionsを分割代入可能な形で返す
 * shapes配列の参照は外部から直接変更できないようにアクションを経由して操作する
 */
export default () => {
  const store = useShapeStore();
  return { ...store, ...storeToRefs(store) };
};
