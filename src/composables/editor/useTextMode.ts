import { ref, type Ref } from 'vue';
import type { TextShape, Shape } from '@/components/editor/types';

/**
 * テキスト入力を管理するcomposable
 */
export function useTextMode(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextTextName: () => string,
  originalImage: Ref<HTMLImageElement | null>,
  selectedColor: Ref<string>
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

    const fontSize = 24;
    // テキストの幅を推定（日本語の場合、フォントサイズとほぼ同じ幅）
    const estimatedWidth = inputText.length * fontSize;

    const text: TextShape = {
      id: `text-${Date.now()}`,
      name: getNextTextName(),
      x: centerX,
      y: centerY,
      text: inputText,
      fontSize: fontSize,
      fontFamily: 'Noto Sans JP',
      fontStyle: 'bold',
      fill: selectedColor.value,
      align: 'center',
      offsetX: estimatedWidth / 2,
      offsetY: fontSize / 2,
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
