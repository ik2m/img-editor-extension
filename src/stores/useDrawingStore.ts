import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { DrawingShape, DrawingLine } from '@/components/editor/types';
import useLayerStore from './useLayerStore';
import useImageStore from './useImageStore';

/**
 * お絵描きモード（フリーハンド描画）を管理するstore
 */
const useDrawingStore = defineStore('drawing', () => {
  const layerStore = useLayerStore();
  const imageStore = useImageStore();
  const { shapes, selectLayer, addShapeAt } = layerStore;
  const { layerScale } = imageStore;

  // State
  const drawingMode = ref<boolean>(false);
  const currentLine = ref<number[]>([]);

  // Getters
  // お絵描きレイヤーを取得または作成
  const drawingLayer = computed(() => {
    return shapes.value.find((s) => s.type === 'drawing');
  });

  const getOrCreateDrawingLayer = (): DrawingShape => {
    let layer = drawingLayer.value;
    if (!layer) {
      layer = {
        type: 'drawing',
        id: 'drawing-layer',
        name: 'お絵描き',
        lines: [],
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
      };
      // 画像レイヤーの直前に配置（配列の先頭）
      addShapeAt(layer, 0);
    }
    return layer;
  };

  const currentDrawing = computed(() => {
    if (currentLine.value.length === 0) return null;
    return {
      points: currentLine.value,
      stroke: '#000000',
      strokeWidth: 2,
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
    currentLine.value = [pos.x / layerScale.value.x, pos.y / layerScale.value.y];
  };

  const continueDrawing = (pos: { x: number; y: number }) => {
    if (currentLine.value.length === 0) return;
    currentLine.value.push(pos.x / layerScale.value.x, pos.y / layerScale.value.y);
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
    // Getters
    currentDrawing,
    // Actions
    toggleDrawingMode,
    startDrawing,
    continueDrawing,
    finishDrawing,
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
