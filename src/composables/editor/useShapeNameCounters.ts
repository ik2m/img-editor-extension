import { ref } from 'vue';

/**
 * 図形名の自動採番を管理するcomposable
 */
export function useShapeNameCounters() {
  const rectCounter = ref(1);
  const arrowCounter = ref(1);
  const textCounter = ref(1);

  const getNextRectName = () => `矩形 ${rectCounter.value++}`;
  const getNextArrowName = () => `矢印 ${arrowCounter.value++}`;
  const getNextTextName = () => `テキスト ${textCounter.value++}`;

  const resetCounters = () => {
    rectCounter.value = 1;
    arrowCounter.value = 1;
    textCounter.value = 1;
  };

  return {
    rectCounter,
    arrowCounter,
    textCounter,
    getNextRectName,
    getNextArrowName,
    getNextTextName,
    resetCounters,
  };
}
