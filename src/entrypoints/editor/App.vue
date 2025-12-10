<script lang="ts" setup>
import { ref } from 'vue';
import { Toaster } from 'vue-sonner';
import type Konva from 'konva';
import EditorHeader from './components/EditorHeader.vue';
import EditorToolbar from './components/EditorToolbar.vue';
import EditorCanvas from './components/EditorCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import { useShapeNameCounters } from './composables/useShapeNameCounters';
import { useLayerManagement } from './composables/useLayerManagement';
import { useImageManagement } from './composables/useImageManagement';
import { useShapeTransform } from './composables/useShapeTransform';
import { useRectangleShape } from './composables/useRectangleShape';
import { useArrowShape } from './composables/useArrowShape';
import { useDrawingMode } from './composables/useDrawingMode';
import { useTextMode } from './composables/useTextMode';
import { useClipboardImage } from './composables/useClipboardImage';

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

const handleStageClick = (targetId: string) => {
  layers.selectLayer(targetId);
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
        @upload-image="image.handleImageUpload"
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
        @add-text="text.addText"
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
      />
    </div>
    <Toaster position="bottom-right" />
  </div>
</template>
