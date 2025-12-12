import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import useShapeStore from './useShapeStore';
import useSettingsStore from './useSettingsStore';
import useImageStore from './useImageStore';

/**
 * 矩形ドラッグ作成モードを管理するstore
 */
const useRectDragStore = defineStore('rectDrag', () => {
  const shapeStore = useShapeStore();
  const { addRectShapeWithPosition, selectLayer } = shapeStore;
  const { rectangleColor } = useSettingsStore();

  // State
  const rectDragMode = ref<boolean>(false);
  const dragStartPos = ref<{ x: number; y: number } | null>(null);
  const dragCurrentPos = ref<{ x: number; y: number } | null>(null);

  // ドラッグ中の一時矩形データを計算
  const currentRectDrag = computed(() => {
    if (!dragStartPos.value || !dragCurrentPos.value) return null;

    const x1 = dragStartPos.value.x;
    const y1 = dragStartPos.value.y;
    const x2 = dragCurrentPos.value.x;
    const y2 = dragCurrentPos.value.y;

    // 左上と幅・高さを計算
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    // 16進数カラーコードからRGBA文字列を生成
    const hexToRgba = (hex: string, alpha: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return {
      x,
      y,
      width,
      height,
      fill: 'transparent',
      stroke: hexToRgba(rectangleColor.value, 0.7),
      strokeWidth: 8,
      cornerRadius: 2,
    };
  });

  // Actions
  const toggleRectDragMode = () => {
    rectDragMode.value = !rectDragMode.value;
    if (!rectDragMode.value) {
      dragStartPos.value = null;
      dragCurrentPos.value = null;
    }
  };

  const startRectDrag = (pos: { x: number; y: number }) => {
    if (!rectDragMode.value) return;
    const { layerScale } = useImageStore();
    dragStartPos.value = {
      x: pos.x / layerScale.value.x,
      y: pos.y / layerScale.value.y,
    };
    dragCurrentPos.value = { ...dragStartPos.value };
  };

  const continueRectDrag = (pos: { x: number; y: number }) => {
    if (!dragStartPos.value) return;
    const { layerScale } = useImageStore();
    dragCurrentPos.value = {
      x: pos.x / layerScale.value.x,
      y: pos.y / layerScale.value.y,
    };
  };

  const finishRectDrag = () => {
    if (!dragStartPos.value || !dragCurrentPos.value) return;

    // 最小サイズチェック（5px以下の矩形は作成しない）
    const width = Math.abs(dragCurrentPos.value.x - dragStartPos.value.x);
    const height = Math.abs(dragCurrentPos.value.y - dragStartPos.value.y);
    if (width < 5 || height < 5) {
      dragStartPos.value = null;
      dragCurrentPos.value = null;
      return;
    }

    // 矩形の左上座標と幅・高さを計算
    const x = Math.min(dragStartPos.value.x, dragCurrentPos.value.x);
    const y = Math.min(dragStartPos.value.y, dragCurrentPos.value.y);

    // 矩形を作成（位置とサイズを指定）
    const rect = addRectShapeWithPosition(
      rectangleColor.value,
      x,
      y,
      width,
      height
    );

    selectLayer(rect.id);

    // リセット
    dragStartPos.value = null;
    dragCurrentPos.value = null;

    // モードを解除して通常モードに戻す
    rectDragMode.value = false;
  };

  return {
    // State
    rectDragMode,
    dragStartPos,
    dragCurrentPos,
    // Getters
    currentRectDrag,
    // Actions
    toggleRectDragMode,
    startRectDrag,
    continueRectDrag,
    finishRectDrag,
  };
});

/**
 * 矩形ドラッグストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useRectDragStore();
  return { ...store, ...storeToRefs(store) };
};
