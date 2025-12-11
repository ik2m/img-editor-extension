import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

/**
 * 図形名の自動採番を管理するstore
 */
const useCounterStore = defineStore('counter', () => {
  // State
  const rectCounter = ref(1);
  const arrowCounter = ref(1);
  const textCounter = ref(1);

  // Actions
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
});

/**
 * カウンターストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useCounterStore();
  return { ...store, ...storeToRefs(store) };
};
