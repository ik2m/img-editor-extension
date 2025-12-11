import { type Ref } from 'vue';
import { useModal } from 'vue-final-modal';
import ImageSourceModal from '@/components/editor/ImageSourceModal.vue';

/**
 * 画像ソース選択モーダルを管理するcomposable
 */
export function useImageSourceModal(
  fileInputRef: Ref<HTMLInputElement | null>,
  loadImageFromBlob: (blob: Blob) => void
) {
  const { open, close } = useModal({
    component: ImageSourceModal,
    attrs: {
      isOpen: true,
      onClose() {
        close();
      },
      onOpenFile() {
        fileInputRef.value?.click();
        close();
      },
      onOpenClipboardImage(blob: Blob) {
        loadImageFromBlob(blob);
        close();
      },
    },
  });

  const openImageSourceModal = () => {
    open();
  };

  return {
    openImageSourceModal,
  };
}
