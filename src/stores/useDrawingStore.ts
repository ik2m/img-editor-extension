import { ref, computed, readonly } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { DrawingShape, DrawingLine } from '@/components/editor/types';
import useShapeStore from './useShapeStore';
import useImageStore from './useImageStore';

/**
 * お絵描きモード（フリーハンド描画）を管理するstore
 */
const useDrawingStore = defineStore('drawing', () => {
  const shapeStore = useShapeStore();
  const imageStore = useImageStore();
  const { selectLayer } = shapeStore;
  const { layerScale } = imageStore;

  // State
  const drawingMode = ref<boolean>(false);
  const currentLine = ref<number[]>([]);
  const drawingLayer = ref<DrawingShape | null>(null);

  const getOrCreateDrawingLayer = (): DrawingShape => {
    if (!drawingLayer.value) {
      drawingLayer.value = {
        type: 'drawing' as const,
        id: 'drawing-layer',
        name: 'お絵描き',
        lines: [],
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
      };
    }
    return drawingLayer.value;
  };

  const resetDrawingLayer = () => {
    drawingLayer.value = null;
  };

  const scaleDrawingLayer = (ratio: number) => {
    if (!drawingLayer.value) return;
    if ('lines' in drawingLayer.value) {
      drawingLayer.value.lines.forEach((line) => {
        line.points = line.points.map((p) => p * ratio);
        line.strokeWidth = Math.max(1, Math.round(line.strokeWidth * ratio));
      });
    }
  };

  const currentDrawing = computed(() => {
    if (currentLine.value.length === 0) return null;
    return {
      points: currentLine.value,
      stroke: '#000000',
      strokeWidth: 2,
      tension: 0.5,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
    };
  });

  // Actions
  const toggleDrawingMode = () => {
    drawingMode.value = !drawingMode.value;
    if (!drawingMode.value) {
      currentLine.value = [];
    }
  };

  const startDrawing = (pos: { x: number; y: number }) => {
    if (!drawingMode.value) return;
    currentLine.value = [
      pos.x / layerScale.value.x,
      pos.y / layerScale.value.y,
    ];
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

  return {
    // State
    drawingMode,
    currentLine,
    drawingLayer,
    // Getters
    currentDrawing,
    // Actions
    toggleDrawingMode,
    startDrawing,
    continueDrawing,
    finishDrawing,
    resetDrawingLayer,
    scaleDrawingLayer,
  };
});

/**
 * お絵描きストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useDrawingStore();
  return { ...store, ...storeToRefs(store) };
};
