<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { useClipboardItems } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { Toaster } from 'vue-sonner';
import Konva from 'konva';
import EditorHeader from './components/EditorHeader.vue';
import EditorToolbar from './components/EditorToolbar.vue';
import EditorCanvas from './components/EditorCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import type { RectShape, ArrowShape, DrawingShape, TextShape, Shape } from './types';
import { isRectShape, isArrowShape, isDrawingShape, isTextShape } from './types';
import { useShapeNameCounters } from './composables/useShapeNameCounters';
import { useLayerManagement } from './composables/useLayerManagement';
import { useImageManagement } from './composables/useImageManagement';

// Composables（Phase 1-2）
const nameCounters = useShapeNameCounters();
const layers = useLayerManagement();
const image = useImageManagement(nameCounters, layers.shapes);

// 既存のロジック（そのまま維持）
const editingLayerId = ref<string>('');
const editingLayerName = ref<string>('');
const layerNameInput = ref<HTMLInputElement | null>(null);
const drawingMode = ref<boolean>(false);
const currentDrawing = ref<DrawingShape | null>(null);
const textMode = ref<boolean>(false);
const canvasRef = ref<{ getStage: () => Konva.Stage | undefined } | null>(null);

// クリップボード機能
const { copy: copyToClipboard, copied, isSupported } = useClipboardItems();

const handleTransformEnd = (e: any) => {
  const shape = layers.shapes.value.find((s) => s.id === layers.selectedShapeId.value);
  if (!shape) return;

  if (isRectShape(shape)) {
    shape.x = e.target.x();
    shape.y = e.target.y();
    shape.fill = Konva.Util.getRandomColor();
  } else if (isArrowShape(shape)) {
    const node = e.target;
    const newPoints = node.points();
    shape.points = newPoints as [number, number, number, number];
  } else if (isDrawingShape(shape)) {
    const node = e.target;
    const newPoints = node.points();
    shape.points = newPoints;
  } else if (isTextShape(shape)) {
    shape.x = e.target.x();
    shape.y = e.target.y();
  }
};

const handleStageClick = (targetId: string) => {
  layers.selectLayer(targetId);
};

const startEditLayerName = async (layer: Shape) => {
  editingLayerId.value = layer.id;
  editingLayerName.value = layer.name;
  await nextTick();
  // layerNameInputはLayerPanel内で管理されるため、ここでの処理は不要
};

const finishEditLayerName = () => {
  if (editingLayerId.value) {
    layers.renameLayer(editingLayerId.value, editingLayerName.value);
    editingLayerId.value = '';
  }
};

const cancelEditLayerName = () => {
  editingLayerId.value = '';
  editingLayerName.value = '';
};

const addRectangle = () => {
  if (!image.imageElement.value) return;
  const rect: RectShape = {
    id: `rect-${Date.now()}`,
    name: nameCounters.getNextRectName(),
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    fill: 'rgba(255, 0, 0, 0.3)',
    stroke: '#ff0000',
    strokeWidth: 3,
    draggable: true,
  };
  layers.shapes.value.push(rect);
  layers.selectLayer(rect.id);
};

const addArrow = () => {
  if (!image.imageElement.value) return;
  const arrow: ArrowShape = {
    id: `arrow-${Date.now()}`,
    name: nameCounters.getNextArrowName(),
    points: [100, 100, 300, 200],
    stroke: '#ff0000',
    strokeWidth: 3,
    fill: '#ff0000',
    pointerLength: 20,
    pointerWidth: 20,
    draggable: true,
  };
  layers.shapes.value.push(arrow);
  layers.selectLayer(arrow.id);
};

const toggleDrawingMode = () => {
  drawingMode.value = !drawingMode.value;
  if (!drawingMode.value) {
    currentDrawing.value = null;
  }
};

const startDrawing = (pos: { x: number; y: number }) => {
  if (!drawingMode.value) return;
  const drawing: DrawingShape = {
    id: `drawing-${Date.now()}`,
    name: nameCounters.getNextDrawingName(),
    points: [pos.x / image.layerScale.value.x, pos.y / image.layerScale.value.y],
    stroke: '#000000',
    strokeWidth: 2,
    tension: 0.5,
    lineCap: 'round',
    lineJoin: 'round',
    draggable: true,
  };
  currentDrawing.value = drawing;
};

const continueDrawing = (pos: { x: number; y: number }) => {
  if (!currentDrawing.value) return;
  currentDrawing.value.points.push(
    pos.x / image.layerScale.value.x,
    pos.y / image.layerScale.value.y
  );
};

const finishDrawing = () => {
  if (!currentDrawing.value) return;
  if (currentDrawing.value.points.length >= 4) {
    layers.shapes.value.push(currentDrawing.value);
    layers.selectLayer(currentDrawing.value.id);
  }
  currentDrawing.value = null;
  drawingMode.value = false;
};

const toggleTextMode = () => {
  textMode.value = !textMode.value;
};

const addText = (pos: { x: number; y: number }) => {
  if (!textMode.value) return;
  const inputText = window.prompt('テキストを入力してください:', 'テキスト');
  if (!inputText) {
    textMode.value = false;
    return;
  }
  const text: TextShape = {
    id: `text-${Date.now()}`,
    name: nameCounters.getNextTextName(),
    x: pos.x / image.layerScale.value.x,
    y: pos.y / image.layerScale.value.y,
    text: inputText,
    fontSize: 24,
    fontFamily: 'Noto Sans JP',
    fill: '#000000',
    align: 'left',
    draggable: true,
  };
  layers.shapes.value.push(text);
  layers.selectLayer(text.id);
  textMode.value = false;
};

const copyImageToClipboard = async () => {
  if (!isSupported.value) {
    toast.error('お使いのブラウザはクリップボード機能に対応していません');
    return;
  }

  if (!canvasRef.value) return;
  const stage = canvasRef.value.getStage();
  if (!stage) return;

  try {
    // Stageを画像に変換
    const dataURL = stage.toDataURL({ pixelRatio: 1 });

    // DataURLをBlobに変換
    const response = await fetch(dataURL);
    const blob = await response.blob();

    // クリップボードにコピー
    await copyToClipboard([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);

    if (copied.value) {
      toast.success('画像をクリップボードにコピーしました');
    }
  } catch (error) {
    console.error('クリップボードへのコピーに失敗しました:', error);
    toast.error('クリップボードへのコピーに失敗しました');
  }
};
</script>

<template>
  <div class="bg-dark-bg flex h-screen flex-col text-white">
    <EditorHeader />

    <div class="flex flex-1 overflow-hidden">
      <EditorToolbar
        :image-url="image.imageUrl.value"
        :drawing-mode="drawingMode"
        :text-mode="textMode"
        @upload-image="image.handleImageUpload"
        @resize-image="image.resizeToMaxWidth840"
        @add-rectangle="addRectangle"
        @add-arrow="addArrow"
        @toggle-drawing-mode="toggleDrawingMode"
        @toggle-text-mode="toggleTextMode"
        @copy-image="copyImageToClipboard"
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
        :drawing-mode="drawingMode"
        :current-drawing="currentDrawing"
        :text-mode="textMode"
        @transform-end="handleTransformEnd"
        @stage-click="handleStageClick"
        @start-drawing="startDrawing"
        @continue-drawing="continueDrawing"
        @finish-drawing="finishDrawing"
        @add-text="addText"
      />

      <LayerPanel
        :shapes="layers.shapes.value"
        :selected-shape-id="layers.selectedShapeId.value"
        :image-url="image.imageUrl.value"
        :editing-layer-id="editingLayerId"
        :editing-layer-name="editingLayerName"
        @add-rectangle="addRectangle"
        @select-layer="layers.selectLayer"
        @move-layer-up="layers.moveLayerUp"
        @move-layer-down="layers.moveLayerDown"
        @delete-layer="layers.deleteLayer"
        @start-edit-name="startEditLayerName"
        @finish-edit-name="finishEditLayerName"
        @cancel-edit-name="cancelEditLayerName"
        @update-editing-name="(name) => (editingLayerName = name)"
      />
    </div>
    <Toaster position="bottom-right" />
  </div>
</template>
