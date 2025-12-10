<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import Konva from 'konva';
import EditorHeader from './components/EditorHeader.vue';
import EditorToolbar from './components/EditorToolbar.vue';
import EditorCanvas from './components/EditorCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import type { RectShape, ArrowShape, DrawingShape, TextShape, Shape } from './types';
import { isRectShape, isArrowShape, isDrawingShape, isTextShape } from './types';

// 全ての状態変数をそのまま保持
const imageUrl = ref<string>('');
const originalImage = ref<HTMLImageElement | null>(null);
const stageWidth = ref<number>(0);
const stageHeight = ref<number>(0);
const layerScale = ref<{ x: number; y: number }>({ x: 1, y: 1 });
const imageElement = ref<HTMLImageElement | null>(null);
const shapes = ref<Shape[]>([]);
const selectedShapeId = ref('');
const rectCounter = ref(1);
const arrowCounter = ref(1);
const drawingCounter = ref(1);
const textCounter = ref(1);
const editingLayerId = ref<string>('');
const editingLayerName = ref<string>('');
const layerNameInput = ref<HTMLInputElement | null>(null);
const drawingMode = ref<boolean>(false);
const currentDrawing = ref<DrawingShape | null>(null);
const textMode = ref<boolean>(false);

// 全ての関数をそのまま保持
const getNextRectName = () => `矩形 ${rectCounter.value++}`;
const getNextArrowName = () => `矢印 ${arrowCounter.value++}`;
const getNextDrawingName = () => `お絵描き ${drawingCounter.value++}`;
const getNextTextName = () => `テキスト ${textCounter.value++}`;

const handleTransformEnd = (e: any) => {
  const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
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
  selectedShapeId.value = targetId;
};

const handleImageUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string;
    loadImageToStage(imageUrl.value);
  };
  reader.readAsDataURL(file);
};

const loadImageToStage = (url: string) => {
  const img = new Image();
  img.onload = () => {
    originalImage.value = img;
    imageElement.value = img;
    stageWidth.value = img.width;
    stageHeight.value = img.height;
    layerScale.value = { x: 1, y: 1 };
    shapes.value = [];
    rectCounter.value = 1;
    arrowCounter.value = 1;
    drawingCounter.value = 1;
    textCounter.value = 1;
  };
  img.src = url;
};

const resizeToMaxWidth840 = () => {
  if (!originalImage.value) return;
  const img = originalImage.value;
  const maxWidth = 840;
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
    layerScale.value = { x: ratio, y: ratio };
    stageWidth.value = width;
    stageHeight.value = height;
  } else {
    layerScale.value = { x: 1, y: 1 };
    stageWidth.value = width;
    stageHeight.value = height;
  }
};

const moveLayerUp = (id: string) => {
  const index = shapes.value.findIndex((s) => s.id === id);
  if (index < shapes.value.length - 1) {
    [shapes.value[index], shapes.value[index + 1]] = [
      shapes.value[index + 1],
      shapes.value[index],
    ];
  }
};

const moveLayerDown = (id: string) => {
  const index = shapes.value.findIndex((s) => s.id === id);
  if (index > 0) {
    [shapes.value[index], shapes.value[index - 1]] = [
      shapes.value[index - 1],
      shapes.value[index],
    ];
  }
};

const deleteLayer = (id: string) => {
  const index = shapes.value.findIndex((s) => s.id === id);
  if (index !== -1) {
    shapes.value.splice(index, 1);
    if (selectedShapeId.value === id) {
      selectedShapeId.value = '';
    }
  }
};

const selectLayer = (id: string) => {
  selectedShapeId.value = id;
};

const renameLayer = (id: string, newName: string) => {
  const shape = shapes.value.find((s) => s.id === id);
  if (shape) {
    shape.name = newName;
  }
};

const startEditLayerName = async (layer: Shape) => {
  editingLayerId.value = layer.id;
  editingLayerName.value = layer.name;
  await nextTick();
  // layerNameInputはLayerPanel内で管理されるため、ここでの処理は不要
};

const finishEditLayerName = () => {
  if (editingLayerId.value) {
    renameLayer(editingLayerId.value, editingLayerName.value);
    editingLayerId.value = '';
  }
};

const cancelEditLayerName = () => {
  editingLayerId.value = '';
  editingLayerName.value = '';
};

const addRectangle = () => {
  if (!imageElement.value) return;
  const rect: RectShape = {
    id: `rect-${Date.now()}`,
    name: getNextRectName(),
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    fill: 'rgba(255, 0, 0, 0.3)',
    stroke: '#ff0000',
    strokeWidth: 3,
    draggable: true,
  };
  shapes.value.push(rect);
  selectLayer(rect.id);
};

const addArrow = () => {
  if (!imageElement.value) return;
  const arrow: ArrowShape = {
    id: `arrow-${Date.now()}`,
    name: getNextArrowName(),
    points: [100, 100, 300, 200],
    stroke: '#ff0000',
    strokeWidth: 3,
    fill: '#ff0000',
    pointerLength: 20,
    pointerWidth: 20,
    draggable: true,
  };
  shapes.value.push(arrow);
  selectLayer(arrow.id);
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
    name: getNextDrawingName(),
    points: [pos.x / layerScale.value.x, pos.y / layerScale.value.y],
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
    pos.x / layerScale.value.x,
    pos.y / layerScale.value.y
  );
};

const finishDrawing = () => {
  if (!currentDrawing.value) return;
  if (currentDrawing.value.points.length >= 4) {
    shapes.value.push(currentDrawing.value);
    selectLayer(currentDrawing.value.id);
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
    name: getNextTextName(),
    x: pos.x / layerScale.value.x,
    y: pos.y / layerScale.value.y,
    text: inputText,
    fontSize: 24,
    fontFamily: 'Noto Sans JP',
    fill: '#000000',
    align: 'left',
    draggable: true,
  };
  shapes.value.push(text);
  selectLayer(text.id);
  textMode.value = false;
};
</script>

<template>
  <div class="bg-dark-bg flex h-screen flex-col text-white">
    <EditorHeader />

    <div class="flex flex-1 overflow-hidden">
      <EditorToolbar
        :image-url="imageUrl"
        :drawing-mode="drawingMode"
        :text-mode="textMode"
        @upload-image="handleImageUpload"
        @resize-image="resizeToMaxWidth840"
        @add-rectangle="addRectangle"
        @add-arrow="addArrow"
        @toggle-drawing-mode="toggleDrawingMode"
        @toggle-text-mode="toggleTextMode"
      />

      <EditorCanvas
        :image-element="imageElement"
        :stage-width="stageWidth"
        :stage-height="stageHeight"
        :layer-scale="layerScale"
        :shapes="shapes"
        :selected-shape-id="selectedShapeId"
        :original-image="originalImage"
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
        :shapes="shapes"
        :selected-shape-id="selectedShapeId"
        :image-url="imageUrl"
        :editing-layer-id="editingLayerId"
        :editing-layer-name="editingLayerName"
        @add-rectangle="addRectangle"
        @select-layer="selectLayer"
        @move-layer-up="moveLayerUp"
        @move-layer-down="moveLayerDown"
        @delete-layer="deleteLayer"
        @start-edit-name="startEditLayerName"
        @finish-edit-name="finishEditLayerName"
        @cancel-edit-name="cancelEditLayerName"
        @update-editing-name="(name) => (editingLayerName = name)"
      />
    </div>
  </div>
</template>
