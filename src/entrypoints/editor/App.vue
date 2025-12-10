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
import { useClipboardImage } from '@/composables/editor/useClipboardImage';

// Composables（Phase 1-4 完全版）
const nameCounters = useShapeNameCounters();
const layers = useLayerManagement();
const image = useImageManagement(nameCounters, layers.shapes);
const transform = useShapeTransform(layers.shapes, layers.selectedShapeId);
const rectangle = useRectangleShape(
  layers.shapes,
  layers.selectLayer,
  nameCounters.getNextRectName,
  image.imageElement
);
const arrow = useArrowShape(
  layers.shapes,
  layers.selectLayer,
  nameCounters.getNextArrowName,
  image.imageElement
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
  image.layerScale
);
const clipboard = useClipboardImage(canvasRef);

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

// Text input modal
const isTextInputModalOpen = computed(() => text.pendingTextPosition.value !== null);

const handleTextSubmit = (inputText: string) => {
  text.finishAddText(inputText);
};

const handleTextCancel = () => {
  text.cancelAddText();
};
</script>

<template>
  <div class="bg-dark-bg flex h-screen flex-col text-white">
    <EditorHeader />

    <div class="flex flex-1 overflow-hidden">
      <EditorToolbar
        :image-url="image.imageUrl.value"
        :drawing-mode="drawing.drawingMode.value"
        :text-mode="text.textMode.value"
        @open-image-source-modal="openImageSourceModal"
        @resize-image="image.resizeToMaxWidth840"
        @add-rectangle="rectangle.addRectangle"
        @add-arrow="arrow.addArrow"
        @toggle-drawing-mode="drawing.toggleDrawingMode"
        @toggle-text-mode="text.toggleTextMode"
        @copy-image="clipboard.copyImageToClipboard"
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
        :text-mode="text.textMode.value"
        @transform-end="transform.handleTransformEnd"
        @stage-click="handleStageClick"
        @start-drawing="drawing.startDrawing"
        @continue-drawing="drawing.continueDrawing"
        @finish-drawing="drawing.finishDrawing"
        @add-text="text.startAddText"
      />

      <LayerPanel
        :shapes="layers.shapes.value"
        :selected-shape-id="layers.selectedShapeId.value"
        :image-url="image.imageUrl.value"
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
      :is-open="isTextInputModalOpen"
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

    <Toaster position="bottom-right" />
  </div>
</template>
