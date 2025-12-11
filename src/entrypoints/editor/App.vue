<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Toaster } from 'vue-sonner';
import { ModalsContainer, useModal } from 'vue-final-modal';
import type Konva from 'konva';
import EditorHeader from '@/components/editor/EditorHeader.vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import EditorCanvas from '@/components/editor/EditorCanvas.vue';
import LayerPanel from '@/components/editor/LayerPanel.vue';
import InfoPanel from '@/components/editor/InfoPanel.vue';
import TextInputModal from '@/components/editor/TextInputModal.vue';
import ImageSourceModal from '@/components/editor/ImageSourceModal.vue';
import useShapeStore from '@/stores/useShapeStore';
import useImageStore from '@/stores/useImageStore';
import useSettingsStore from '@/stores/useSettingsStore';
import { downloadImage, copyImageToClipboard } from '@/utils/imageExport';
import { createRectangle, createArrow, createText } from '@/utils/shapeFactory';

// Pinia stores
const {
  selectLayer,
  addShape,
  addTextShape,
  getNextRectName,
  getNextArrowName,
  getNextTextName,
} = useShapeStore();

const {
  originalImage,
  stageWidth,
  stageHeight,
  isImageLoaded,
  handleImageUpload,
  loadImageFromBlob,
  applyTargetWidth,
} = useImageStore();

const { rectangleColor, arrowColor, textColor, targetWidth, setTargetWidth } =
  useSettingsStore();

const canvasRef = ref<{ getStage: () => Konva.Stage | undefined } | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Image source modal
const { open: openImageSourceModal, close: closeImageSourceModal } = useModal<
  typeof ImageSourceModal
>({
  component: ImageSourceModal,
  attrs: {
    onClose() {
      closeImageSourceModal();
    },
    onOpenFile() {
      fileInputRef.value?.click();
    },
    onOpenClipboardImage(blob: Blob) {
      loadImageFromBlob(blob, targetWidth);
    },
  },
});

// Text modal
const { open: openTextModal, close: closeTextModal } = useModal<
  typeof TextInputModal
>({
  component: TextInputModal,
  attrs: {
    onClose() {
      closeTextModal();
    },
    onSubmit(inputText: string) {
      if (!originalImage.value) return;

      // 画像の中央に配置
      const centerX = originalImage.value.width / 2;
      const centerY = originalImage.value.height / 2;

      const text = addTextShape(inputText, textColor.value, centerX, centerY);
      selectLayer(text.id);
    },
  },
});

// Shape creation handlers
const handleAddRectangle = () => {
  if (!isImageLoaded.value) return;
  const rect = createRectangle(getNextRectName(), rectangleColor.value);
  addShape(rect);
  selectLayer(rect.id);
};

const handleAddArrow = () => {
  if (!isImageLoaded.value) return;
  const arrow = createArrow(getNextArrowName(), arrowColor.value);
  addShape(arrow);
  selectLayer(arrow.id);
};

// targetWidthの変更を監視して、画像が読み込まれている場合はリサイズ
watch(targetWidth, (newWidth) => {
  if (originalImage.value) {
    applyTargetWidth(newWidth);
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleImageUpload(file, targetWidth);
  }
};

const handleSaveImage = () => {
  const stage = canvasRef.value?.getStage();
  if (!stage) return;

  // トランスフォーマーを一時的に非表示
  const transformers = stage.find('Transformer');
  const transformerVisibilities = transformers.map((t) => t.visible());
  transformers.forEach((t) => t.visible(false));

  try {
    const dataURL = stage.toDataURL({ pixelRatio: 1 });
    downloadImage(dataURL);
  } finally {
    // トランスフォーマーを元に戻す
    transformers.forEach((t, i) => t.visible(transformerVisibilities[i]));
  }
};

const handleCopyImage = async () => {
  const stage = canvasRef.value?.getStage();
  if (!stage) return;

  // トランスフォーマーを一時的に非表示
  const transformers = stage.find('Transformer');
  const transformerVisibilities = transformers.map((t) => t.visible());
  transformers.forEach((t) => t.visible(false));

  try {
    const dataURL = stage.toDataURL({ pixelRatio: 1 });
    await copyImageToClipboard(dataURL);
  } finally {
    // トランスフォーマーを元に戻す
    transformers.forEach((t, i) => t.visible(transformerVisibilities[i]));
  }
};
</script>

<template>
  <div class="bg-dark-bg flex h-screen flex-col text-white">
    <EditorHeader />

    <div class="flex flex-1 overflow-hidden">
      <EditorToolbar
        @open-image-source-modal="openImageSourceModal"
        @save-image="handleSaveImage"
        @copy-image="handleCopyImage"
        @add-rectangle="handleAddRectangle"
        @add-arrow="handleAddArrow"
        @add-text="openTextModal"
      />

      <EditorCanvas ref="canvasRef" />

      <LayerPanel />
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <Toaster position="top-center" />

    <InfoPanel :width="stageWidth" :height="stageHeight" />

    <ModalsContainer />
  </div>
</template>
