import { ref, computed, type Ref } from 'vue';
import type { DrawingShape, DrawingLine, Shape } from '@/components/editor/types';
import { isDrawingShape } from '@/components/editor/types';

/**
 * お絵描きモード（フリーハンド描画）を管理するcomposable
 */
export function useDrawingMode(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  layerScale: Ref<{ x: number; y: number }>
) {
  const drawingMode = ref<boolean>(false);
  const currentLine = ref<number[]>([]);

  // お絵描きレイヤーを取得または作成
  const drawingLayer = computed(() => {
    return shapes.value.find(isDrawingShape);
  });

  const getOrCreateDrawingLayer = (): DrawingShape => {
    let layer = drawingLayer.value;
    if (!layer) {
      layer = {
        id: 'drawing-layer',
        name: 'お絵描き',
        lines: [],
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
      };
      // 画像レイヤーの直前に配置（配列の先頭）
      shapes.value.unshift(layer);
    }
    return layer;
  };

  const toggleDrawingMode = () => {
    drawingMode.value = !drawingMode.value;
    if (!drawingMode.value) {
      currentLine.value = [];
    }
  };

  const startDrawing = (pos: { x: number; y: number }) => {
    if (!drawingMode.value) return;
    currentLine.value = [pos.x / layerScale.value.x, pos.y / layerScale.value.y];
  };

  const continueDrawing = (pos: { x: number; y: number }) => {
    if (currentLine.value.length === 0) return;
    currentLine.value.push(
      pos.x / layerScale.value.x,
      pos.y / layerScale.value.y
    );
  };

  const finishDrawing = () => {
    if (currentLine.value.length < 4) {
      currentLine.value = [];
      return;
    }

    const layer = getOrCreateDrawingLayer();
    const newLine: DrawingLine = {
      points: [...currentLine.value],
      stroke: '#000000',
      strokeWidth: 2,
    };
    layer.lines.push(newLine);
    selectLayer(layer.id);
    currentLine.value = [];
  };

  const currentDrawingLine = computed(() => {
    if (currentLine.value.length === 0) return null;
    return {
      points: currentLine.value,
      stroke: '#000000',
      strokeWidth: 2,
    };
  });

  return {
    drawingMode,
    currentDrawing: currentDrawingLine,
    toggleDrawingMode,
    startDrawing,
    continueDrawing,
    finishDrawing,
  };
}
