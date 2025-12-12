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
import FloatingControl from '@/components/editor/FloatingControl.vue';
import TextInputModal from '@/components/editor/TextInputModal.vue';
import ImageSourceModal from '@/components/editor/ImageSourceModal.vue';
import useShapeStore from '@/stores/useShapeStore';
import useImageStore from '@/stores/useImageStore';
import useSettingsStore from '@/stores/useSettingsStore';
import useRectDragStore from '@/stores/useRectDragStore';
import { downloadImage, copyImageToClipboard } from '@/utils/imageExport';

// Pinia stores
const {
  shapes,
  selectedShapeId,
  selectLayer,
  addArrowShape,
  addTextShape,
  updateTextFontSize,
  updateTextColor,
  updateArrowColor,
  updateRectColor,
} = useShapeStore();

const { toggleRectDragMode } = useRectDragStore();

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

// 選択されたレイヤーを取得
const selectedTextLayer = computed(() => {
  const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
  return shape && shape.type === 'text' ? shape : null;
});

const selectedArrowLayer = computed(() => {
  const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
  return shape && shape.type === 'arrow' ? shape : null;
});

const selectedRectLayer = computed(() => {
  const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
  return shape && shape.type === 'rect' ? shape : null;
});

const handleFontSizeChange = (delta: number) => {
  if (!selectedTextLayer.value) return;
  const newSize = Math.max(
    8,
    Math.min(200, selectedTextLayer.value.fontSize + delta)
  );
  updateTextFontSize(selectedTextLayer.value.id, newSize);
};

const handleTextColorChange = (color: string) => {
  if (!selectedTextLayer.value) return;
  updateTextColor(selectedTextLayer.value.id, color);
};

const handleArrowColorChange = (color: string) => {
  if (!selectedArrowLayer.value) return;
  updateArrowColor(selectedArrowLayer.value.id, color);
};

const handleRectColorChange = (color: string) => {
  if (!selectedRectLayer.value) return;
  updateRectColor(selectedRectLayer.value.id, color);
};

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
  toggleRectDragMode();
};

const handleAddArrow = () => {
  if (!isImageLoaded.value) return;
  const arrow = addArrowShape(arrowColor.value);
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

    <FloatingControl
      v-if="selectedTextLayer"
      label="テキスト"
      :value="selectedTextLayer.fontSize"
      :color="selectedTextLayer.fill"
      unit="px"
      :step="2"
      @change="handleFontSizeChange"
      @color-change="handleTextColorChange"
    />

    <FloatingControl
      v-else-if="selectedArrowLayer"
      label="矢印"
      :color="selectedArrowLayer.stroke"
      @color-change="handleArrowColorChange"
    />

    <FloatingControl
      v-else-if="selectedRectLayer"
      label="矩形"
      :color="selectedRectLayer.stroke"
      @color-change="handleRectColorChange"
    />

    <ModalsContainer />
  </div>
</template>
