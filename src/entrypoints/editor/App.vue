<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Toaster } from 'vue-sonner';
import type Konva from 'konva';
import EditorHeader from '@/components/editor/EditorHeader.vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import EditorCanvas from '@/components/editor/EditorCanvas.vue';
import LayerPanel from '@/components/editor/LayerPanel.vue';
import ImageSourceModal from '@/components/editor/ImageSourceModal.vue';
import TextInputModal from '@/components/editor/TextInputModal.vue';
import { useShapeNameCounters } from '@/composables/editor/useShapeNameCounters';
import { useLayerManagement } from '@/composables/editor/useLayerManagement';
import { useImageManagement } from '@/composables/editor/useImageManagement';
import { useShapeTransform } from '@/composables/editor/useShapeTransform';
import { useRectangleShape } from '@/composables/editor/useRectangleShape';
import { useArrowShape } from '@/composables/editor/useArrowShape';
import { useDrawingMode } from '@/composables/editor/useDrawingMode';
import { useTextMode } from '@/composables/editor/useTextMode';
import { useShapeColor } from '@/composables/editor/useShapeColor';
import { downloadImage, copyImageToClipboard } from '@/utils/imageExport';

// Composables（Phase 1-4 完全版）
const nameCounters = useShapeNameCounters();
const layers = useLayerManagement();
const image = useImageManagement(nameCounters, layers.shapes);
const transform = useShapeTransform(layers.shapes, layers.selectedShapeId);
const shapeColor = useShapeColor();
const rectangle = useRectangleShape(
  layers.shapes,
  layers.selectLayer,
  nameCounters.getNextRectName,
  image.imageElement,
  shapeColor.rectangleColor
);
const arrow = useArrowShape(
  layers.shapes,
  layers.selectLayer,
  nameCounters.getNextArrowName,
  image.imageElement,
  shapeColor.arrowColor
);
const canvasRef = ref<{ getStage: () => Konva.Stage | undefined } | null>(null);
const drawing = useDrawingMode(
  layers.shapes,
  layers.selectLayer,
  nameCounters.getNextDrawingName,
  image.layerScale
);
const text = useTextMode(
  layers.shapes,
  layers.selectLayer,
  nameCounters.getNextTextName,
  image.originalImage,
  shapeColor.textColor
);
// Modal state
const isImageSourceModalOpen = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleStageClick = (targetId: string) => {
  layers.selectLayer(targetId);
};

const openImageSourceModal = () => {
  isImageSourceModalOpen.value = true;
};

const closeImageSourceModal = () => {
  isImageSourceModalOpen.value = false;
};

const handleOpenFile = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    image.handleImageUpload(file);
  }
};

const handleOpenClipboardImage = (blob: Blob) => {
  image.loadImageFromBlob(blob);
};

const handleTextSubmit = (inputText: string) => {
  text.addText(inputText);
};

const handleTextCancel = () => {
  text.cancelAddText();
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
        :image-url="image.imageUrl.value"
        :drawing-mode="drawing.drawingMode.value"
        :rectangle-color="shapeColor.rectangleColor.value"
        :arrow-color="shapeColor.arrowColor.value"
        :text-color="shapeColor.textColor.value"
        @open-image-source-modal="openImageSourceModal"
        @resize-image="image.resizeToMaxWidth840"
        @save-image="handleSaveImage"
        @copy-image="handleCopyImage"
        @add-rectangle="rectangle.addRectangle"
        @add-arrow="arrow.addArrow"
        @toggle-drawing-mode="drawing.toggleDrawingMode"
        @add-text="text.openTextInput"
        @select-rectangle-color="shapeColor.setRectangleColor"
        @select-arrow-color="shapeColor.setArrowColor"
        @select-text-color="shapeColor.setTextColor"
      />

      <EditorCanvas
        ref="canvasRef"
        :image-element="image.imageElement.value"
        :stage-width="image.stageWidth.value"
        :stage-height="image.stageHeight.value"
        :layer-scale="image.layerScale.value"
        :shapes="layers.shapes.value"
        :selected-shape-id="layers.selectedShapeId.value"
        :original-image="image.originalImage.value"
        :drawing-mode="drawing.drawingMode.value"
        :current-drawing="drawing.currentDrawing.value"
        @transform-end="transform.handleTransformEnd"
        @stage-click="handleStageClick"
        @start-drawing="drawing.startDrawing"
        @continue-drawing="drawing.continueDrawing"
        @finish-drawing="drawing.finishDrawing"
      />

      <LayerPanel
        :shapes="layers.shapes.value"
        :selected-shape-id="layers.selectedShapeId.value"
        :image-url="image.imageUrl.value"
        :drawing-mode="drawing.drawingMode.value"
        @add-rectangle="rectangle.addRectangle"
        @select-layer="layers.selectLayer"
        @move-layer-up="layers.moveLayerUp"
        @move-layer-down="layers.moveLayerDown"
        @delete-layer="layers.deleteLayer"
        @reorder-layers="layers.reorderLayers"
      />
    </div>

    <ImageSourceModal
      :is-open="isImageSourceModalOpen"
      @close="closeImageSourceModal"
      @open-file="handleOpenFile"
      @open-clipboard-image="handleOpenClipboardImage"
    />

    <TextInputModal
      :is-open="text.isTextInputOpen.value"
      @close="handleTextCancel"
      @submit="handleTextSubmit"
    />

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <Toaster position="top-center" />
  </div>
</template>
