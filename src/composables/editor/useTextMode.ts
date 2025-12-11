import { type Ref } from 'vue';
import { useModal } from 'vue-final-modal';
import type { Shape } from '@/components/editor/types';
import { createText } from '@/utils/shapeFactory';
import TextInputModal from '@/components/editor/TextInputModal.vue';

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
  const { open, close } = useModal({
    component: TextInputModal,
    attrs: {
      isOpen: true,
      onClose() {
        close();
      },
      onSubmit(inputText: string) {
        if (!originalImage.value) return;

        // 画像の中央に配置
        const centerX = originalImage.value.width / 2;
        const centerY = originalImage.value.height / 2;

        const text = createText(
          getNextTextName(),
          inputText,
          selectedColor.value,
          centerX,
          centerY
        );
        shapes.value.push(text);
        selectLayer(text.id);
        close();
      },
    },
  });

  const openTextInput = () => {
    open();
  };

  return {
    openTextInput,
  };
}
