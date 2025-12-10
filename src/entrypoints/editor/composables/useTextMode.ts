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

  const toggleTextMode = () => {
    textMode.value = !textMode.value;
  };

  const addText = (pos: { x: number; y: number }) => {
    if (!textMode.value) return;
    const inputText = window.prompt('テキストを入力してください:', 'テキスト');
    if (!inputText) {
      textMode.value = false;
      return;
    }
    const text: TextShape = {
      id: `text-${Date.now()}`,
      name: getNextTextName(),
      x: pos.x / layerScale.value.x,
      y: pos.y / layerScale.value.y,
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
  };

  return {
    textMode,
    toggleTextMode,
    addText,
  };
}
