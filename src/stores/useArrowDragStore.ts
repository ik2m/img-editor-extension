import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import useShapeStore from './useShapeStore';
import useSettingsStore from './useSettingsStore';
import useImageStore from './useImageStore';

/**
 * 矢印ドラッグ作成モードを管理するstore
 */
const useArrowDragStore = defineStore('arrowDrag', () => {
  const shapeStore = useShapeStore();
  const { addArrowShapeWithPosition, selectLayer } = shapeStore;
  const { arrowColor } = useSettingsStore();

  // State
  const arrowDragMode = ref<boolean>(false);
  const dragStartPos = ref<{ x: number; y: number } | null>(null);
  const dragCurrentPos = ref<{ x: number; y: number } | null>(null);

  // ドラッグ中の一時矢印データを計算
  const currentArrowDrag = computed(() => {
    if (!dragStartPos.value || !dragCurrentPos.value) return null;

    // 16進数カラーコードからRGBA文字列を生成
    const hexToRgba = (hex: string, alpha: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const rgba = hexToRgba(arrowColor.value, 0.7);

    return {
      points: [
        dragStartPos.value.x,
        dragStartPos.value.y,
        dragCurrentPos.value.x,
        dragCurrentPos.value.y,
      ],
      stroke: rgba,
      strokeWidth: 8,
      fill: rgba,
      pointerLength: 20,
      pointerWidth: 20,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
    };
  });

  // Actions
  const toggleArrowDragMode = () => {
    arrowDragMode.value = !arrowDragMode.value;
    if (!arrowDragMode.value) {
      dragStartPos.value = null;
      dragCurrentPos.value = null;
    }
  };

  const startArrowDrag = (pos: { x: number; y: number }) => {
    if (!arrowDragMode.value) return;
    const { layerScale } = useImageStore();
    dragStartPos.value = {
      x: pos.x / layerScale.value.x,
      y: pos.y / layerScale.value.y,
    };
    dragCurrentPos.value = { ...dragStartPos.value };
  };

  const continueArrowDrag = (pos: { x: number; y: number }) => {
    if (!dragStartPos.value) return;
    const { layerScale } = useImageStore();
    dragCurrentPos.value = {
      x: pos.x / layerScale.value.x,
      y: pos.y / layerScale.value.y,
    };
  };

  const finishArrowDrag = () => {
    if (!dragStartPos.value || !dragCurrentPos.value) return;

    // 最小長さチェック（5px以下の矢印は作成しない）
    const dx = dragCurrentPos.value.x - dragStartPos.value.x;
    const dy = dragCurrentPos.value.y - dragStartPos.value.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 5) {
      dragStartPos.value = null;
      dragCurrentPos.value = null;
      return;
    }

    // 矢印を作成（始点と終点を指定）
    const arrow = addArrowShapeWithPosition(
      arrowColor.value,
      dragStartPos.value.x,
      dragStartPos.value.y,
      dragCurrentPos.value.x,
      dragCurrentPos.value.y
    );

    selectLayer(arrow.id);

    // リセット
    dragStartPos.value = null;
    dragCurrentPos.value = null;

    // モードを解除して通常モードに戻す
    arrowDragMode.value = false;
  };

  return {
    // State
    arrowDragMode,
    dragStartPos,
    dragCurrentPos,
    // Getters
    currentArrowDrag,
    // Actions
    toggleArrowDragMode,
    startArrowDrag,
    continueArrowDrag,
    finishArrowDrag,
  };
});

/**
 * 矢印ドラッグストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useArrowDragStore();
  return { ...store, ...storeToRefs(store) };
};
