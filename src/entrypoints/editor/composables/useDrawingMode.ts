import { ref, type Ref } from 'vue';
import type { DrawingShape, Shape } from '../types';

/**
 * お絵描きモード（フリーハンド描画）を管理するcomposable
 */
export function useDrawingMode(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextDrawingName: () => string,
  layerScale: Ref<{ x: number; y: number }>
) {
  const drawingMode = ref<boolean>(false);
  const currentDrawing = ref<DrawingShape | null>(null);

  const toggleDrawingMode = () => {
    drawingMode.value = !drawingMode.value;
    if (!drawingMode.value) {
      currentDrawing.value = null;
    }
  };

  const startDrawing = (pos: { x: number; y: number }) => {
    if (!drawingMode.value) return;
    const drawing: DrawingShape = {
      id: `drawing-${Date.now()}`,
      name: getNextDrawingName(),
      points: [pos.x / layerScale.value.x, pos.y / layerScale.value.y],
      stroke: '#000000',
      strokeWidth: 2,
      tension: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    };
    currentDrawing.value = drawing;
  };

  const continueDrawing = (pos: { x: number; y: number }) => {
    if (!currentDrawing.value) return;
    currentDrawing.value.points.push(
      pos.x / layerScale.value.x,
      pos.y / layerScale.value.y
    );
  };

  const finishDrawing = () => {
    if (!currentDrawing.value) return;
    if (currentDrawing.value.points.length >= 4) {
      shapes.value.push(currentDrawing.value);
      selectLayer(currentDrawing.value.id);
    }
    currentDrawing.value = null;
    drawingMode.value = false;
  };

  return {
    drawingMode,
    currentDrawing,
    toggleDrawingMode,
    startDrawing,
    continueDrawing,
    finishDrawing,
  };
}
