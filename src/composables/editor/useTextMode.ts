import { ref, type Ref } from 'vue';
import type { TextShape, Shape } from '@/components/editor/types';

/**
 * テキスト入力を管理するcomposable
 */
export function useTextMode(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextTextName: () => string,
  originalImage: Ref<HTMLImageElement | null>
) {
  const isTextInputOpen = ref<boolean>(false);

  const openTextInput = () => {
    isTextInputOpen.value = true;
  };

  const addText = (inputText: string) => {
    if (!originalImage.value) return;

    // 画像の中央に配置
    const centerX = originalImage.value.width / 2;
    const centerY = originalImage.value.height / 2;

    const text: TextShape = {
      id: `text-${Date.now()}`,
      name: getNextTextName(),
      x: centerX,
      y: centerY,
      text: inputText,
      fontSize: 24,
      fontFamily: 'Noto Sans JP',
      fill: '#000000',
      align: 'center',
      draggable: true,
    };
    shapes.value.push(text);
    selectLayer(text.id);
    isTextInputOpen.value = false;
  };

  const cancelAddText = () => {
    isTextInputOpen.value = false;
  };

  return {
    isTextInputOpen,
    openTextInput,
    addText,
    cancelAddText,
  };
}
