import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

/**
 * ツールモードの種類
 */
export type ToolMode = 'none' | 'drawing' | 'rect' | 'arrow';

/**
 * ツールモードを一元管理するstore
 * すべてのツールモード（お絵描き、矩形、矢印など）を統合管理
 */
const useToolModeStore = defineStore('toolMode', () => {
  // 現在のアクティブなモード
  const currentMode = ref<ToolMode>('none');

  // 各モードの状態をcomputedで提供
  const isDrawingMode = computed(() => currentMode.value === 'drawing');
  const isRectMode = computed(() => currentMode.value === 'rect');
  const isArrowMode = computed(() => currentMode.value === 'arrow');
  const isAnyModeActive = computed(() => currentMode.value !== 'none');

  // モード設定（排他的に切り替え）
  const setMode = (mode: ToolMode) => {
    currentMode.value = mode;
  };

  // モードをトグル（同じモードならオフ、違うモードなら切り替え）
  const toggleMode = (mode: ToolMode) => {
    if (currentMode.value === mode) {
      currentMode.value = 'none';
    } else {
      currentMode.value = mode;
    }
  };

  // 特定のモードに切り替え
  const setDrawingMode = () => setMode('drawing');
  const setRectMode = () => setMode('rect');
  const setArrowMode = () => setMode('arrow');
  const clearMode = () => setMode('none');

  // モードをトグル
  const toggleDrawingMode = () => toggleMode('drawing');
  const toggleRectMode = () => toggleMode('rect');
  const toggleArrowMode = () => toggleMode('arrow');

  return {
    // State
    currentMode,
    // Computed
    isDrawingMode,
    isRectMode,
    isArrowMode,
    isAnyModeActive,
    // Actions
    setMode,
    toggleMode,
    setDrawingMode,
    setRectMode,
    setArrowMode,
    clearMode,
    toggleDrawingMode,
    toggleRectMode,
    toggleArrowMode,
  };
});

/**
 * ツールモードストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useToolModeStore();
  return { ...store, ...storeToRefs(store) };
};
