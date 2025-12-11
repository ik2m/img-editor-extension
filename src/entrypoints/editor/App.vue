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
import { useShapeNameCounters } from '@/composables/editor/useShapeNameCounters';
import { useLayerManagement } from '@/composables/editor/useLayerManagement';
import { useImageManagement } from '@/composables/editor/useImageManagement';
import { useDrawingMode } from '@/composables/editor/useDrawingMode';
import { useImageSourceModal } from '@/composables/editor/useImageSourceModal';
import { useShapeColor } from '@/composables/editor/useShapeColor';
import { useSettings } from '@/composables/editor/useSettings';
import { downloadImage, copyImageToClipboard } from '@/utils/imageExport';
import { createRectangle, createArrow, createText } from '@/utils/shapeFactory';

// Settings
const { settings, updateSetting } = useSettings();
const targetWidth = computed({
  get: () => settings.value.targetWidth,
  set: (value: number | 'original') => updateSetting('targetWidth', value),
});

// Composables
const nameCounters = useShapeNameCounters();
const layers = useLayerManagement();
const image = useImageManagement(nameCounters, layers.shapes, targetWidth);
const shapeColor = useShapeColor();
const canvasRef = ref<{ getStage: () => Konva.Stage | undefined } | null>(null);
const drawing = useDrawingMode(
  layers.shapes,
  layers.selectLayer,
  image.layerScale
);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageSourceModal = useImageSourceModal(
  fileInputRef,
  image.loadImageFromBlob
);

// Text modal
const { open: openTextModal, close: closeTextModal } = useModal({
  component: TextInputModal,
  attrs: {
    isOpen: true,
    onClose() {
      closeTextModal();
    },
    onSubmit(inputText: string) {
      if (!image.originalImage.value) return;

      // 画像の中央に配置
      const centerX = image.originalImage.value.width / 2;
      const centerY = image.originalImage.value.height / 2;

      const text = createText(
        nameCounters.getNextTextName(),
        inputText,
        shapeColor.textColor.value,
        centerX,
        centerY
      );
      layers.shapes.value.push(text);
      layers.selectLayer(text.id);
      closeTextModal();
    },
  },
});

// Shape creation handlers
const handleAddRectangle = () => {
  if (!image.imageElement.value) return;
  const rect = createRectangle(
    nameCounters.getNextRectName(),
    shapeColor.rectangleColor.value
  );
  layers.shapes.value.push(rect);
  layers.selectLayer(rect.id);
};

const handleAddArrow = () => {
  if (!image.imageElement.value) return;
  const arrow = createArrow(
    nameCounters.getNextArrowName(),
    shapeColor.arrowColor.value
  );
  layers.shapes.value.push(arrow);
  layers.selectLayer(arrow.id);
};

// targetWidthの変更を監視して、画像が読み込まれている場合はリサイズ
watch(targetWidth, (newWidth) => {
  if (image.originalImage.value) {
    image.applyTargetWidth(newWidth);
  }
});

const handleStageClick = (targetId: string) => {
  layers.selectLayer(targetId);
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    image.handleImageUpload(file);
  }
};

const handleUpdateArrowPoint = (
  shapeId: string,
  pointIndex: number,
  x: number,
  y: number
) => {
  const shapeIndex = layers.shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = layers.shapes.value[shapeIndex];
  if (!('points' in shape)) return;

  const newPoints = [...shape.points] as [number, number, number, number];
  if (pointIndex === 0) {
    newPoints[0] = x;
    newPoints[1] = y;
  } else if (pointIndex === 2) {
    newPoints[2] = x;
    newPoints[3] = y;
  }

  // 配列全体を更新してリアクティビティをトリガー
  layers.shapes.value = [
    ...layers.shapes.value.slice(0, shapeIndex),
    { ...shape, points: newPoints },
    ...layers.shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateRectCorner = (
  shapeId: string,
  corner: string,
  x: number,
  y: number
) => {
  const shapeIndex = layers.shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = layers.shapes.value[shapeIndex];
  if (!('width' in shape && 'height' in shape)) return;

  let newX = shape.x;
  let newY = shape.y;
  let newWidth = shape.width;
  let newHeight = shape.height;

  switch (corner) {
    case 'tl': // 左上
      newWidth = shape.x + shape.width - x;
      newHeight = shape.y + shape.height - y;
      newX = x;
      newY = y;
      break;
    case 'tr': // 右上
      newWidth = x - shape.x;
      newHeight = shape.y + shape.height - y;
      newY = y;
      break;
    case 'bl': // 左下
      newWidth = shape.x + shape.width - x;
      newHeight = y - shape.y;
      newX = x;
      break;
    case 'br': // 右下
      newWidth = x - shape.x;
      newHeight = y - shape.y;
      break;
  }

  // 最小サイズを確保
  if (newWidth < 10) newWidth = 10;
  if (newHeight < 10) newHeight = 10;

  // 配列全体を更新してリアクティビティをトリガー
  layers.shapes.value = [
    ...layers.shapes.value.slice(0, shapeIndex),
    { ...shape, x: newX, y: newY, width: newWidth, height: newHeight },
    ...layers.shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateTextFontSize = (shapeId: string, fontSize: number) => {
  const shapeIndex = layers.shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = layers.shapes.value[shapeIndex];
  if (!('fontSize' in shape)) return;

  // 配列全体を更新してリアクティビティをトリガー
  layers.shapes.value = [
    ...layers.shapes.value.slice(0, shapeIndex),
    { ...shape, fontSize },
    ...layers.shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateTextPosition = (shapeId: string, x: number, y: number) => {
  const shapeIndex = layers.shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = layers.shapes.value[shapeIndex];
  if (!('text' in shape)) return;

  // 配列全体を更新してリアクティビティをトリガー
  layers.shapes.value = [
    ...layers.shapes.value.slice(0, shapeIndex),
    { ...shape, x, y },
    ...layers.shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateRectPosition = (shapeId: string, x: number, y: number) => {
  const shapeIndex = layers.shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = layers.shapes.value[shapeIndex];
  if (!('width' in shape && 'height' in shape)) return;

  // 配列全体を更新してリアクティビティをトリガー
  layers.shapes.value = [
    ...layers.shapes.value.slice(0, shapeIndex),
    { ...shape, x, y },
    ...layers.shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateArrowPosition = (
  shapeId: string,
  deltaX: number,
  deltaY: number
) => {
  const shapeIndex = layers.shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = layers.shapes.value[shapeIndex];
  if (!('points' in shape)) return;

  // 始点と終点を移動量分だけ移動
  const newPoints: [number, number, number, number] = [
    shape.points[0] + deltaX,
    shape.points[1] + deltaY,
    shape.points[2] + deltaX,
    shape.points[3] + deltaY,
  ];

  // 配列全体を更新してリアクティビティをトリガー
  layers.shapes.value = [
    ...layers.shapes.value.slice(0, shapeIndex),
    { ...shape, points: newPoints },
    ...layers.shapes.value.slice(shapeIndex + 1),
  ];
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
        :target-width="targetWidth"
        @open-image-source-modal="imageSourceModal.openImageSourceModal"
        @save-image="handleSaveImage"
        @copy-image="handleCopyImage"
        @add-rectangle="handleAddRectangle"
        @add-arrow="handleAddArrow"
        @toggle-drawing-mode="drawing.toggleDrawingMode"
        @add-text="openTextModal"
        @select-rectangle-color="shapeColor.setRectangleColor"
        @select-arrow-color="shapeColor.setArrowColor"
        @select-text-color="shapeColor.setTextColor"
        @select-target-width="targetWidth = $event"
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
        @stage-click="handleStageClick"
        @start-drawing="drawing.startDrawing"
        @continue-drawing="drawing.continueDrawing"
        @finish-drawing="drawing.finishDrawing"
        @update-arrow-point="handleUpdateArrowPoint"
        @update-rect-corner="handleUpdateRectCorner"
        @update-text-position="handleUpdateTextPosition"
        @update-rect-position="handleUpdateRectPosition"
        @update-arrow-position="handleUpdateArrowPosition"
      />

      <LayerPanel
        :shapes="layers.shapes.value"
        :selected-shape-id="layers.selectedShapeId.value"
        :image-url="image.imageUrl.value"
        :drawing-mode="drawing.drawingMode.value"
        @add-rectangle="handleAddRectangle"
        @select-layer="layers.selectLayer"
        @move-layer-up="layers.moveLayerUp"
        @move-layer-down="layers.moveLayerDown"
        @delete-layer="layers.deleteLayer"
        @reorder-layers="layers.reorderLayers"
        @update-text-font-size="handleUpdateTextFontSize"
      />
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <Toaster position="top-center" />

    <InfoPanel
      :width="image.stageWidth.value"
      :height="image.stageHeight.value"
    />

    <ModalsContainer />
  </div>
</template>
