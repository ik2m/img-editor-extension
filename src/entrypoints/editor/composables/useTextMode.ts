import { ref, type Ref } from 'vue';
import type { TextShape, Shape } from '../types';

/**
 * テキストモード（テキスト注釈の作成）を管理するcomposable
 */
export function useTextMode(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextTextName: () => string,
  layerScale: Ref<{ x: number; y: number }>
) {
  const textMode = ref<boolean>(false);
  const pendingTextPosition = ref<{ x: number; y: number } | null>(null);

  const toggleTextMode = () => {
    textMode.value = !textMode.value;
  };

  const startAddText = (pos: { x: number; y: number }) => {
    if (!textMode.value) return;
    pendingTextPosition.value = {
      x: pos.x / layerScale.value.x,
      y: pos.y / layerScale.value.y,
    };
  };

  const finishAddText = (inputText: string) => {
    if (!pendingTextPosition.value) return;
    const text: TextShape = {
      id: `text-${Date.now()}`,
      name: getNextTextName(),
      x: pendingTextPosition.value.x,
      y: pendingTextPosition.value.y,
      text: inputText,
      fontSize: 24,
      fontFamily: 'Noto Sans JP',
      fill: '#000000',
      align: 'left',
      draggable: true,
    };
    shapes.value.push(text);
    selectLayer(text.id);
    textMode.value = false;
    pendingTextPosition.value = null;
  };

  const cancelAddText = () => {
    pendingTextPosition.value = null;
    textMode.value = false;
  };

  return {
    textMode,
    pendingTextPosition,
    toggleTextMode,
    startAddText,
    finishAddText,
    cancelAddText,
  };
}
