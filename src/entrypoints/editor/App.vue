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
import { useShapeNameCounters } from '@/composables/editor/useShapeNameCounters';
import { useLayerManagement } from '@/composables/editor/useLayerManagement';
import { useImageManagement } from '@/composables/editor/useImageManagement';
import { useDrawingMode } from '@/composables/editor/useDrawingMode';
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
const {
  rectCounter,
  arrowCounter,
  textCounter,
  getNextRectName,
  getNextArrowName,
  getNextTextName,
  resetCounters,
} = useShapeNameCounters();

const {
  shapes,
  selectedShapeId,
  selectLayer,
  moveLayerUp,
  moveLayerDown,
  deleteLayer,
  reorderLayers,
} = useLayerManagement();

const {
  imageUrl,
  originalImage,
  imageElement,
  stageWidth,
  stageHeight,
  layerScale,
  isImageLoaded,
  handleImageUpload,
  loadImageToStage,
  loadImageFromBlob,
  applyTargetWidth,
} = useImageManagement(
  {
    rectCounter,
    arrowCounter,
    textCounter,
    getNextRectName,
    getNextArrowName,
    getNextTextName,
    resetCounters,
  },
  shapes,
  targetWidth
);

const {
  rectangleColor,
  arrowColor,
  textColor,
  setRectangleColor,
  setArrowColor,
  setTextColor,
} = useShapeColor();

const canvasRef = ref<{ getStage: () => Konva.Stage | undefined } | null>(null);

const {
  drawingMode,
  currentDrawing,
  toggleDrawingMode,
  startDrawing,
  continueDrawing,
  finishDrawing,
} = useDrawingMode(shapes, selectLayer, layerScale);

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
      loadImageFromBlob(blob);
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

      const text = createText(
        getNextTextName(),
        inputText,
        textColor.value,
        centerX,
        centerY
      );
      shapes.value.push(text);
      selectLayer(text.id);
    },
  },
});

// Shape creation handlers
const handleAddRectangle = () => {
  if (!isImageLoaded.value) return;
  const rect = createRectangle(getNextRectName(), rectangleColor.value);
  shapes.value.push(rect);
  selectLayer(rect.id);
};

const handleAddArrow = () => {
  if (!isImageLoaded.value) return;
  const arrow = createArrow(getNextArrowName(), arrowColor.value);
  shapes.value.push(arrow);
  selectLayer(arrow.id);
};

// targetWidthの変更を監視して、画像が読み込まれている場合はリサイズ
watch(targetWidth, (newWidth) => {
  if (originalImage.value) {
    applyTargetWidth(newWidth);
  }
});

const handleStageClick = (targetId: string) => {
  selectLayer(targetId);
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleImageUpload(file);
  }
};

const handleUpdateArrowPoint = (
  shapeId: string,
  pointIndex: number,
  x: number,
  y: number
) => {
  const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = shapes.value[shapeIndex];
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
  shapes.value = [
    ...shapes.value.slice(0, shapeIndex),
    { ...shape, points: newPoints },
    ...shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateRectCorner = (
  shapeId: string,
  corner: string,
  x: number,
  y: number
) => {
  const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = shapes.value[shapeIndex];
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
  shapes.value = [
    ...shapes.value.slice(0, shapeIndex),
    { ...shape, x: newX, y: newY, width: newWidth, height: newHeight },
    ...shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateTextFontSize = (shapeId: string, fontSize: number) => {
  const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = shapes.value[shapeIndex];
  if (!('fontSize' in shape)) return;

  // 配列全体を更新してリアクティビティをトリガー
  shapes.value = [
    ...shapes.value.slice(0, shapeIndex),
    { ...shape, fontSize },
    ...shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateTextPosition = (shapeId: string, x: number, y: number) => {
  const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = shapes.value[shapeIndex];
  if (!('text' in shape)) return;

  // 配列全体を更新してリアクティビティをトリガー
  shapes.value = [
    ...shapes.value.slice(0, shapeIndex),
    { ...shape, x, y },
    ...shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateRectPosition = (shapeId: string, x: number, y: number) => {
  const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = shapes.value[shapeIndex];
  if (!('width' in shape && 'height' in shape)) return;

  // 配列全体を更新してリアクティビティをトリガー
  shapes.value = [
    ...shapes.value.slice(0, shapeIndex),
    { ...shape, x, y },
    ...shapes.value.slice(shapeIndex + 1),
  ];
};

const handleUpdateArrowPosition = (
  shapeId: string,
  deltaX: number,
  deltaY: number
) => {
  const shapeIndex = shapes.value.findIndex((s) => s.id === shapeId);
  if (shapeIndex === -1) return;

  const shape = shapes.value[shapeIndex];
  if (!('points' in shape)) return;

  // 始点と終点を移動量分だけ移動
  const newPoints: [number, number, number, number] = [
    shape.points[0] + deltaX,
    shape.points[1] + deltaY,
    shape.points[2] + deltaX,
    shape.points[3] + deltaY,
  ];

  // 配列全体を更新してリアクティビティをトリガー
  shapes.value = [
    ...shapes.value.slice(0, shapeIndex),
    { ...shape, points: newPoints },
    ...shapes.value.slice(shapeIndex + 1),
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
        :image-url="imageUrl"
        :drawing-mode="drawingMode"
        :rectangle-color="rectangleColor"
        :arrow-color="arrowColor"
        :text-color="textColor"
        :target-width="targetWidth"
        @open-image-source-modal="openImageSourceModal"
        @save-image="handleSaveImage"
        @copy-image="handleCopyImage"
        @add-rectangle="handleAddRectangle"
        @add-arrow="handleAddArrow"
        @toggle-drawing-mode="toggleDrawingMode"
        @add-text="openTextModal"
        @select-rectangle-color="setRectangleColor"
        @select-arrow-color="setArrowColor"
        @select-text-color="setTextColor"
        @select-target-width="targetWidth = $event"
      />

      <EditorCanvas
        ref="canvasRef"
        :image-element="imageElement"
        :stage-width="stageWidth"
        :stage-height="stageHeight"
        :layer-scale="layerScale"
        :shapes="shapes"
        :selected-shape-id="selectedShapeId"
        :original-image="originalImage"
        :drawing-mode="drawingMode"
        :current-drawing="currentDrawing"
        @stage-click="handleStageClick"
        @start-drawing="startDrawing"
        @continue-drawing="continueDrawing"
        @finish-drawing="finishDrawing"
        @update-arrow-point="handleUpdateArrowPoint"
        @update-rect-corner="handleUpdateRectCorner"
        @update-text-position="handleUpdateTextPosition"
        @update-rect-position="handleUpdateRectPosition"
        @update-arrow-position="handleUpdateArrowPosition"
      />

      <LayerPanel
        :shapes="shapes"
        :selected-shape-id="selectedShapeId"
        :image-url="imageUrl"
        :drawing-mode="drawingMode"
        @add-rectangle="handleAddRectangle"
        @select-layer="selectLayer"
        @move-layer-up="moveLayerUp"
        @move-layer-down="moveLayerDown"
        @delete-layer="deleteLayer"
        @reorder-layers="reorderLayers"
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

    <InfoPanel :width="stageWidth" :height="stageHeight" />

    <ModalsContainer />
  </div>
</template>
